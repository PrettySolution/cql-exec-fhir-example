library EXM74 version '10.2.000'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers
include MATGlobalCommonFunctions version '5.0.000' called Global
include Hospice version '2.0.000' called Hospice
include SupplementalDataElements version '2.0.0' called SDE

codesystem "LOINC": 'http://loinc.org'

valueset "Clinical Oral Evaluation": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.125.12.1003'
valueset "Fluoride Varnish Application for Children": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.125.12.1002'
valueset "Office Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1001'
valueset "Mammography": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1001'
valueset "Preventive Care - Established Office Visit, 0 to 17": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1024'
valueset "Preventive Care Services - Established Office Visit, 18 and Up": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1025'
valueset "Preventive Care Services-Initial Office Visit, 18 and Up": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1023'
valueset "Preventive Care- Initial Office Visit, 0 to 17": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1022'

code "Birth date": '21112-8' from "LOINC" display 'Birth date'

parameter "Measurement Period" Interval<DateTime>
  default Interval[@2020-01-01T00:00:00.0, @2021-01-01T00:00:00.0)

context Patient

define "SDE Ethnicity":
  SDE."SDE Ethnicity"

define "SDE Payer":
  SDE."SDE Payer"

define "SDE Race":
  SDE."SDE Race"

define "SDE Sex":
  SDE."SDE Sex"

define "Denominator":
  "Initial Population"

define "Qualifying Encounters":
  ( ["Encounter": "Office Visit"]
    union ["Encounter": "Preventive Care - Established Office Visit, 0 to 17"]
    union ["Encounter": "Preventive Care- Initial Office Visit, 0 to 17"]
    union ["Encounter": "Preventive Care Services - Established Office Visit, 18 and Up"]
    union ["Encounter": "Preventive Care Services-Initial Office Visit, 18 and Up"]
    union ["Encounter": "Clinical Oral Evaluation"] ) ValidEncounter
    where Global."Normalize Interval"(ValidEncounter.period) during "Measurement Period"
      and ValidEncounter.status = 'finished'

define "Denominator Exclusions":
  Hospice."Has Hospice"

define "Stratification 2":
  exists ["Patient"] BirthDate
    where Global."CalendarAgeInYearsAt" ( FHIRHelpers.ToDate(BirthDate.birthDate), start of "Measurement Period" ) in Interval[5, 11]

define "Stratification 3":
  exists ["Patient"] BirthDate
    where Global."CalendarAgeInYearsAt" ( FHIRHelpers.ToDate(BirthDate.birthDate), start of "Measurement Period" ) in Interval[12, 20 )

define "Stratification 1":
  exists ( ["Patient"] BirthDate
      where Global."CalendarAgeInMonthsAt" ( FHIRHelpers.ToDate(BirthDate.birthDate), start of "Measurement Period" ) >= 6
        and Global."CalendarAgeInYearsAt" ( FHIRHelpers.ToDate(BirthDate.birthDate), start of "Measurement Period" ) <= 4
  )

define "Initial Population":
  exists ( ["Patient"] BirthDate
      where Global."CalendarAgeInMonthsAt" ( FHIRHelpers.ToDate(BirthDate.birthDate), start of "Measurement Period" ) >= 6
        and Global."CalendarAgeInYearsAt" ( FHIRHelpers.ToDate(BirthDate.birthDate), start of "Measurement Period" ) < 20
  )
    and exists ( "Qualifying Encounters" )

define "Numerator":
  exists ( [DiagnosticReport: "Mammography"] Mammogram
          where ( Global."Normalize Interval" ( Mammogram.effective ) ends 27 months or less on or before end of "Measurement Period"
          )
            and Mammogram.status in { 'final', 'amended', 'corrected', 'appended' }
      )
