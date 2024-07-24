## Generating a new reduced-langtags.json file

Simply run the `reduce.sh` script from this directory like this inside the git bash
shell window:
```
./reduce.sh
```
If you want to ensure a fresh copy of the `langtags.json` file, delete any
existing copy in this folder first:
```
rm langtags.json
./reduce.sh
```
(An existing copy of `langtags.json` is used for processing to save download time.)

After generating a new version of the `reduced-langtags.json` file, it will need to
be copied (or moved) to the src/components/AggregateGrid folder:
```
cp reduced-langtags.json ../../src/components/AggregateGrid
```
or
```
mv reduced-langtags.json ../../src/components/AggregateGrid
```

### Developer notes

There is no need to use either npm or yarn as far as I can tell.  Perhaps node is
trying to keep up with bun?

The shell script may need to have its line endings changed if you want to run it
under another shell such as the Cygwin bash shell window or the Windows Subsystem
for Linux shell window.
