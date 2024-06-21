# Directory Structure

## service-worker

The main background process. Requires all files it needs and registers any listeners.

Functions here cannot use functions in this scope via chrome.messaging!

## views

Extension specific sites, contains the settings page and the extension popup

## styles

Common styles for UI elements

## lib

Shared code accross all participants. Mainly certain services or data classes

## bridge

Contains functions which are goig _from foreground to background_ or vice versa

## foreground

Scripts that run in the context of the currently opened tab.

Functions here cannot use functions in this scope via chrome.messaging!

### lib

helper functions for the foreground scope

### global

Holds content scripts **automatically** injected into **all** sites, providing certain functionality for the parsing process.

### apps

Holds content scripts **automatically** injected into **certain** sites, controlling how to interact with the specifics of the content presented there.

### scripts

Holds content scripts **manually** injected into **any** site upon request, installing neccessary functionality when required
