const fs = require("fs");
const path = require("path");
const cql = require("cql-execution");
const cqlfhir = require("cql-exec-fhir");
const cqlvsac = require("cql-exec-vsac");

const fhirBundle1 = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'r4', 'bundles', 'Johnnie679.json'),'utf8'));

const fhirBundle2 = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'r4', 'bundles', 'Luna60.json'),'utf8'));

const elmFile = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'r4', 'cql', 'exm74', 'EXM74-10.2.000.json'),'utf8'));

const libraries = {
    FHIRHelpers: JSON.parse(fs.readFileSync(path.join(__dirname, 'r4', 'cql', 'exm74', 'FHIRHelpers-4.0.1.json'), 'utf8')),
    Global: JSON.parse(fs.readFileSync(path.join(__dirname, 'r4', 'cql', 'exm74', 'MATGlobalCommonFunctions-5.0.000.json'), 'utf8')),
    Hospice: JSON.parse(fs.readFileSync(path.join(__dirname, 'r4', 'cql', 'exm74', 'Hospice-2.0.000.json'), 'utf8')),
    SDE: JSON.parse(fs.readFileSync(path.join(__dirname, 'r4', 'cql', 'exm74', 'SupplementalDataElements-2.0.0.json'), 'utf8')),
};

const codeService = new cqlvsac.CodeService(
    path.join(__dirname, 'r4', 'cql', 'exm74', 'vsac_cache'),true);

const libraryManager = new cql.Repository(libraries)
const library = new cql.Library(elmFile, libraryManager);

codeService.ensureValueSetsInLibraryWithAPIKey(library, true , 'f52a90ad-4d3b-4955-ba5c-635264536b53', true)
    .then(() => {
        console.log('ensureValueSetsInLibraryWithAPIKey');
        const executor = new cql.Executor(library, codeService);
        const patientSource = cqlfhir.PatientSource.FHIRv401();
        patientSource.loadBundles([fhirBundle1, fhirBundle2]);
        const result = executor.exec(patientSource);
        console.log(result);
    })
    .catch((err) => console.log('Error ensureValueSetsInLibraryWithAPIKey', err));