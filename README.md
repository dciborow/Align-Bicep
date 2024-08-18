# Align Bicep

Based on https://github.com/OldStarchy/Align-Spaces

Aligns certain operators by visually stretching the leading characters, this way you can have groups of aligned code, without having to deal with meaningless whitespace changes in your commits.

> Got a suggestion or issue? [Raise an issue on GitHub](https://github.com/aNickzz/Align-Spaces/issues/new)

<!--  -->

> Workspace Trust Support ✔

The default keybinding to toggle alignment is `ctrl` + `shift` + `=`.  
The default keybinding to trigger manual alignment is `ctrl` + `shift` + `\`.

## Config

Set `"align-bicep.delay"` to a number to wait a number of milliseconds before realigning on typing / document change, or set it to "off" and use the `align-bicep.realign` command to realign.

## Features

```bicep
// Aligns parameters:
param location string
param name string = uniqueString(resourceGroup().id)
param resourceGroupName string = resourceGroup().name
param subnetID string = ''
param enableVNET bool = false
param isZoneRedundant bool = false
param storageAccountType string = isZoneRedundant ? 'Standard_ZRS' : 'Standard_LRS'

// Aligns Nested Values

var networkAcls = enableVNET ? {
  defaultAction: 'Deny'
  virtualNetworkRules: [
    {
      action: 'Allow'
      id: subnetID
    }
  ]
} : {}

// Format Output
output id string = newOrExisting == 'new' ? newStorageAccount.id : storageAccount.id
output blobStorageConnectionString string = blobStorageConnectionString
```

Will appear visually as

<!-- prettier-ignore -->
```bicep
param location 			 string
param name 				 string = uniqueString(resourceGroup().id)
param resourceGroupName  string = resourceGroup().name
param subnetID 		 	 string = ''
param enableVNET 		   bool = false
param isZoneRedundant 	   bool = false
param storageAccountType string = isZoneRedundant ? 'Standard_ZRS' : 'Standard_LRS'

// Aligns Nested Values 

var networkAcls = enableVNET ? {
  defaultAction      : 'Deny'
  virtualNetworkRules: [
    {
      action: 'Allow'
      id    : subnetID
    }
  ]
} : {}

// Format Output
output id                          string = newOrExisting == 'new' ? newStorageAccount.id : storageAccount.id
output blobStorageConnectionString string = blobStorageConnectionString
```

This works by adjusting the width of the character.
The source file is not changed, nor are extra characters shown in the browser (so auto-format will not try to undo the formatting).

## New GitHub Action for PR Title Modification

We have added a new GitHub action that uses Azure OpenAI to automatically add the appropriate PR prefix to pull request titles. This ensures that all PRs follow the required naming conventions.

### Configuration

To configure the Azure OpenAI credentials, follow these steps:

1. Go to your repository on GitHub.
2. Click on `Settings`.
3. In the left sidebar, click on `Secrets and variables` and then `Actions`.
4. Click on `New repository secret`.
5. Add the following secrets:
   - `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint.
   - `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key.

## Known Issues

- Rectangular selections are borked

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md)
