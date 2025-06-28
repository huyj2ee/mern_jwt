#!/bin/bash
cd ../frontend/
rm -r -f build/
npm install
npm run build
cd ../backend/
rm -r -f public
mkdir public
cp -r ../frontend/build/* public
