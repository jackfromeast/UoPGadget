## ExpoSE+

ExpoSE+ is a *targeting* dynamic symbolic execution for Javascript, aiming to explore paths between specific points A and B and generate valid input. Unlike its predecessor, ExpoSE, which focused on code coverage and program verification, ExpoSE+ is specifically designed for the automatic generation of exploits based on interesting paths.

ExpoSE is a dynamic symbolic execution engine for JavaScript, developed at Royal Holloway, University of London by [Blake Loring](https://www.parsed.uk), Duncan Mitchell, and [Johannes Kinder](https://www.unibw.de/patch) (now at [Bundeswehr University Munich](https://www.unibw.de/)). 
ExpoSE supports symbolic execution of Node.js programs and JavaScript in the browser. ExpoSE is based on Jalangi2 and the Z3 SMT solver.

## Installment
```
git clone https://github.com/jackfromeast/PPAEG.git

cd ExpoSE+
npm install

cd ./node_modules/z3javascript/
npm run build

cd jalangi2
npm install
```