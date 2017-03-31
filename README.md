# Bungie Database Browser

Just a basic web app that downloads the public game manifest for Destiny, downloads the world asset database, unzips, and then just provides a frontend to visually browse the database.

A literal parsing and traversal of the bungie world asset database. Similar to Bungie's [Armory site](https://www.bungie.net/en/Armory), but way uglier.

The data backing this site is powered by the databases contained with the game manifests **[found here](https://bungie.net/platform/Destiny/Manifest/)**. These databases provide definitions for game assets for use in specific applications interfacing with the Destiny API.

In the case of this website, it is entirely powered by the asset database and therefore does not require logging in, API keys, or any user-provided data. Since this is the raw data from the database, you may run into entries that are clearly for test and not meant to be seen by anyone else. You will also run into "classified" items, which you must find in-game for yourself in order to know what they are.
