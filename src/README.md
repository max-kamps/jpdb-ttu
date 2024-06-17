# Directory Structure

## apps

Holds content scripts **automatically** injected into certain sites, controlling how to interact with the specifics of the content presented there.

## lib

Shared code accross all participants. Mainly certain services or data classes

## service-worker

The service worker runs in the background, provides eventing endpoints and does the heavy lifting of parsing and evaluating.

## sites

Extension specific sites, contains the settings page and the extension popup

## styles

Common styles for UI elements

## views
