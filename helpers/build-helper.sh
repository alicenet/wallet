#!/bin/bash
rm -rf app-build/* &&
cd app/client &&
npm run build &&
cd ../../ &&
mv app/client/build/* ./app-build &&
cp -r ./app/electron ./app-build