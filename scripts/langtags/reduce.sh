#!/bin/sh
# download langtags.json if we don't already have it
if [ ! -f langtags.json ]; then
    wget 'https://ldml.api.sil.org/index.html?query=langtags&ext=json' -O langtags.json
fi

# run the javascript program to extract the reduced data
node extract-reduction.js
