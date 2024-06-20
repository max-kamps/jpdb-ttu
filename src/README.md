# Directory Structure

## apps

Holds content scripts **automatically** injected into **certain** sites, controlling how to interact with the specifics of the content presented there.

## integrations

Holds content scripts **automatically** injected into **all** sites, providing certain functionality for the parsing process.

## lib

Shared code accross all participants. Mainly certain services or data classes

## scripts

Holds content scripts **manually** injected into **any** site upon request, installing neccessary functionality when required

## service-worker

The service worker runs in the background, provides eventing endpoints and does the heavy lifting of parsing and evaluating.

## sites

Extension specific sites, contains the settings page and the extension popup

## styles

Common styles for UI elements
