---
name: azure-bicep-deploy
description: Use when a project needs Azure infrastructure - generate infra/bicep/main.bicep and its modules (App Service, Static Web Apps, Key Vault, monitoring) following this pattern, tailored to the actual project name and environments. Also use when reviewing existing Bicep in infra/bicep/*.bicep.
acknowledgments: |
  Naming-token convention, security-requirements table, and the Log
  Analytics / Application Insights / Key Vault module shapes are adapted
  from microsoft/skills (https://github.com/microsoft/skills, MIT License),
  specifically azure-prepare's bicep/patterns.md and azure-deploy's
  cicd/examples/github-bicep.yml. The App Service, Static Web App, and
  cross-module role-assignment modules below were authored for this
  toolkit and validated with `az bicep build`.
---

# Azure Bicep standards

This skill doesn't ship a copy of `infra/bicep/` for you to inherit -
generate it fresh for each project, using the patterns below, with the
actual `appName`/environments/SKUs for that project. Nothing here is a
secret or project-specific value; fill those in when you generate the
files.

## File layout

```
infra/
  bicep/
    main.bicep              Entry point (resource group scope)
    main.parameters.json    Names, SKUs, locations, tags — never secrets
    modules/
      app-service.bicep
      static-web-app.bicep
      key-vault.bicep
      monitoring.bicep
      kv-role-assignment.bicep
```

## Naming convention

Azure Cloud Adoption Framework abbreviations, parameterized by
`appName`/`environmentName` so dev/staging/prod never collide:

```
app-{appName}-{env}     App Service
plan-{appName}-{env}    App Service Plan
stapp-{appName}-{env}   Static Web App
kv-{appName}-{env}      Key Vault (24-char cap — take() it)
log-{appName}-{env}     Log Analytics workspace
appi-{appName}-{env}    Application Insights
```

For resources whose names must be globally unique and short (storage
accounts, container registries), prefer a `uniqueString()`-derived token
instead of the environment name:

```bicep
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location)
var storName = 'stor${resourceToken}'                          // alphanumeric only
var acrName = replace('cr${appName}${resourceToken}', '-', '') // alphanumeric only
```

## Security requirements (non-negotiable)

| Requirement | Pattern |
|---|---|
| No hardcoded secrets anywhere in `.bicep`/`.bicepparam`/parameters | Runtime secrets flow through Key Vault + a Key Vault reference app setting |
| Managed identity, not a credential | `identity: { type: 'SystemAssigned' }`, RBAC-granted access |
| HTTPS only | `httpsOnly: true` |
| TLS 1.2+ | `minTlsVersion: '1.2'` |
| No public blob/anonymous access | `allowBlobPublicAccess: false` on any storage account |
| Key Vault uses RBAC, not access policies | `enableRbacAuthorization: true` |

## `main.bicep`

```bicep
targetScope = 'resourceGroup'

@minLength(3)
@maxLength(15)
param appName string

@allowed(['dev', 'staging', 'prod'])
param environmentName string

param location string = resourceGroup().location
param apiSkuName string = 'B1'

@allowed(['Free', 'Standard'])
param staticWebAppSkuName string = 'Free'

param tags object = {
  project: appName
  environment: environmentName
  managedBy: 'bicep'
}

module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring'
  params: { appName: appName, environmentName: environmentName, location: location, tags: tags }
}

module keyVault 'modules/key-vault.bicep' = {
  name: 'keyVault'
  params: {
    appName: appName
    environmentName: environmentName
    location: location
    tags: tags
    enablePurgeProtection: environmentName == 'prod'
  }
}

module appService 'modules/app-service.bicep' = {
  name: 'appService'
  params: {
    appName: appName
    environmentName: environmentName
    location: location
    tags: tags
    skuName: apiSkuName
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    keyVaultUri: keyVault.outputs.vaultUri
  }
}

module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'staticWebApp'
  params: {
    appName: appName
    environmentName: environmentName
    tags: tags
    skuName: staticWebAppSkuName
    linkedApiResourceId: staticWebAppSkuName == 'Standard' ? appService.outputs.resourceId : ''
  }
}

// Grant the API's managed identity read access to secrets - see the
// kv-role-assignment note below for why this is its own module.
module apiKeyVaultAccess 'modules/kv-role-assignment.bicep' = {
  name: 'apiKeyVaultAccess'
  params: {
    keyVaultName: keyVault.outputs.vaultName
    principalId: appService.outputs.principalId
  }
}

output apiHostName string = appService.outputs.defaultHostName
output webHostName string = staticWebApp.outputs.defaultHostname
output keyVaultName string = keyVault.outputs.vaultName
```

## `modules/monitoring.bicep`

Every environment gets Log Analytics + Application Insights wired to the
API - "we'll add monitoring later" is how SMB sites end up undebuggable in
production. The connection string is not a Key Vault secret: it's
ingestion-only and grants no access to manage resources, so it's safe to
wire directly into an app setting.

```bicep
param appName string
param environmentName string
param location string = resourceGroup().location
param tags object = {}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-${appName}-${environmentName}'
  location: location
  tags: tags
  properties: { sku: { name: 'PerGB2018' }, retentionInDays: 30 }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${appName}-${environmentName}'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
  }
}

output appInsightsConnectionString string = appInsights.properties.ConnectionString
output logAnalyticsWorkspaceId string = logAnalytics.id
```

## `modules/key-vault.bicep`

Nothing is ever written to the vault from Bicep or CI - secrets are added
out-of-band by whoever owns them (see `secrets-and-gitignore-hygiene`).

```bicep
param appName string
param environmentName string
param location string = resourceGroup().location
param tags object = {}
param enablePurgeProtection bool = true

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: take('kv-${appName}-${environmentName}', 24)
  location: location
  tags: tags
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enablePurgeProtection: enablePurgeProtection
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
  }
}

output vaultUri string = keyVault.properties.vaultUri
output vaultResourceId string = keyVault.id
output vaultName string = keyVault.name
```

## `modules/app-service.bicep`

Linux, `.NET` runtime stack, system-assigned managed identity, and a Key
Vault reference for the one setting that's genuinely sensitive
(`ConnectionStrings__Default`). `alwaysOn` is conditional because F1/D1
tiers reject it outright - fine for a low-traffic dev/staging SMB site,
upgrade the SKU for production.

```bicep
param appName string
param environmentName string
param location string = resourceGroup().location
param tags object = {}
param skuName string = 'B1'
param dotnetVersion string = '10.0'
param appInsightsConnectionString string
param keyVaultUri string

var supportsAlwaysOn = !(skuName == 'F1' || skuName == 'D1')

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'plan-${appName}-${environmentName}'
  location: location
  tags: tags
  sku: { name: skuName }
  kind: 'linux'
  properties: { reserved: true }
}

resource api 'Microsoft.Web/sites@2023-12-01' = {
  name: 'app-${appName}-${environmentName}'
  location: location
  tags: tags
  identity: { type: 'SystemAssigned' }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|${dotnetVersion}'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      alwaysOn: supportsAlwaysOn
      appSettings: [
        { name: 'ASPNETCORE_ENVIRONMENT', value: environmentName == 'prod' ? 'Production' : 'Development' }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsightsConnectionString }
        { name: 'ConnectionStrings__Default', value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/db-connection-string/)' }
      ]
    }
  }
}

output principalId string = api.identity.principalId
output resourceId string = api.id
output defaultHostName string = api.properties.defaultHostName
```

## `modules/static-web-app.bicep`

Bicep only creates the resource shell - the built `dist/` output deploys
from GitHub Actions with a scoped deployment token (see
`github-actions-cicd`), not from this template.

```bicep
param appName string
param environmentName string
param location string = 'westeurope' // Static Web Apps is only available in a subset of regions
param tags object = {}

@allowed(['Free', 'Standard'])
param skuName string = 'Free'
param linkedApiResourceId string = ''

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: 'stapp-${appName}-${environmentName}'
  location: location
  tags: tags
  sku: { name: skuName, tier: skuName }
  properties: { provider: 'GitHubActions' }
}

resource linkedBackend 'Microsoft.Web/staticSites/linkedBackends@2023-12-01' = if (!empty(linkedApiResourceId)) {
  parent: staticWebApp
  name: 'api'
  properties: { backendResourceId: linkedApiResourceId, region: location }
}

output resourceId string = staticWebApp.id
output defaultHostname string = staticWebApp.properties.defaultHostname
```

Use `Standard` only when linking a backend or using custom auth; `Free` is
fine for a purely static marketing site with no API dependency.

## `modules/kv-role-assignment.bicep`

Assigning a role to a resource via a cross-module `existing` reference
needs the target name as a plain input parameter, not another module's
*output* used directly in a `name`/`scope` expression - Bicep requires
those resolvable before the nested deployment starts (`BCP120` otherwise).
That's the entire reason this is a separate module instead of inlined in
`main.bicep`.

```bicep
param keyVaultName string
param principalId string
param roleDefinitionId string = '4633458b-17de-408a-b874-0445c86b69e6' // Key Vault Secrets User

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, principalId, roleDefinitionId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleDefinitionId)
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
```

## `main.parameters.json`

ARM JSON syntax (not `.bicepparam`). Placeholder values only - names,
SKUs, locations, tags - never a connection string or key.

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "appName": { "value": "CHANGE-ME" },
    "environmentName": { "value": "prod" },
    "location": { "value": "eastus2" },
    "apiSkuName": { "value": "B1" },
    "staticWebAppSkuName": { "value": "Free" }
  }
}
```

## Deploying safely

Always run `what-if` before an actual deployment, and treat an unexpected
delete/replace in the output as a stop-and-investigate signal:

```bash
az bicep build --file infra/bicep/main.bicep   # syntax check
az deployment group what-if \
  --resource-group rg-<appName>-<env> \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/main.parameters.json
```

## Review checklist

- [ ] No literal secret, connection string, or key anywhere in `.bicep` or
      `.bicepparam`/`main.parameters.json`.
- [ ] Resource names follow the CAF abbreviation + `appName` + `env`
      pattern (or `uniqueString()` token for globally-unique names).
- [ ] New sensitive setting flows through Key Vault + managed identity, not
      a plain app setting.
- [ ] `httpsOnly` / `minTlsVersion` / `enableRbacAuthorization` unchanged
      from the module defaults.
- [ ] `az bicep build` compiles clean and `what-if` output was reviewed
      before applying to a shared environment.
