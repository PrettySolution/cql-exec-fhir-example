library EXM74 version '10.2.000'


using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers

context Patient

define "Initial Population":
    Patient.gender = 'female'

define "Denominator":
    "Initial Population"
