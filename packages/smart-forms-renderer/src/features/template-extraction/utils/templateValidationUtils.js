"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDC_TEMPLATE_EXTRACTION_PROFILE = void 0;
exports.verifyTemplateProfile = verifyTemplateProfile;
exports.validateBMITemplate = validateBMITemplate;
exports.isBMITemplate = isBMITemplate;
exports.isBloodPressureTemplate = isBloodPressureTemplate;
exports.validateBloodPressureTemplate = validateBloodPressureTemplate;
exports.extractTemplateObservations = extractTemplateObservations;
var SDC_TEMPLATE_PROFILE = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template';
var SDC_TEMPLATE_EXTENSION = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template';
var SDC_OBSERVATION_TEMPLATE_PROFILE = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationTemplate';
// Export for backward compatibility
exports.SDC_TEMPLATE_EXTRACTION_PROFILE = SDC_TEMPLATE_PROFILE;
function verifyTemplateProfile(questionnaire) {
    var _a, _b, _c;
    // Check for the template extension
    var hasTemplateExtension = (_a = questionnaire.extension) === null || _a === void 0 ? void 0 : _a.some(function (ext) { return ext.url === SDC_TEMPLATE_EXTENSION && ext.valueBoolean === true; });
    if (!hasTemplateExtension) {
        return {
            isValid: false,
            error: {
                code: 'missing-profile',
                message: 'Questionnaire must have the template extension'
            }
        };
    }
    // Check for either template profile
    var hasTemplateProfile = (_c = (_b = questionnaire.meta) === null || _b === void 0 ? void 0 : _b.profile) === null || _c === void 0 ? void 0 : _c.some(function (profile) { return profile === SDC_TEMPLATE_PROFILE || profile === SDC_OBSERVATION_TEMPLATE_PROFILE; });
    if (!hasTemplateProfile) {
        return {
            isValid: false,
            error: {
                code: 'invalid-profile',
                message: 'Questionnaire must have either the SDC template profile or observation template profile'
            }
        };
    }
    return { isValid: true };
}
function validateBMITemplate(questionnaire) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    // Check for required contained observations
    var heightObs = (_a = questionnaire.contained) === null || _a === void 0 ? void 0 : _a.find(function (obs) { return obs.resourceType === 'Observation' && obs.id === 'height-obs'; });
    var weightObs = (_b = questionnaire.contained) === null || _b === void 0 ? void 0 : _b.find(function (obs) { return obs.resourceType === 'Observation' && obs.id === 'weight-obs'; });
    var bmiObs = (_c = questionnaire.contained) === null || _c === void 0 ? void 0 : _c.find(function (obs) { return obs.resourceType === 'Observation' && obs.id === 'bmi-obs'; });
    if (!heightObs || !weightObs || !bmiObs) {
        return {
            isValid: false,
            error: {
                code: 'invalid-bmi-template',
                message: 'BMI template must contain height, weight, and BMI observations'
            }
        };
    }
    // Check for required items with template references
    var bmiCalculationItem = (_d = questionnaire.item) === null || _d === void 0 ? void 0 : _d.find(function (item) { return item.linkId === 'bmi-calculation'; });
    if (!bmiCalculationItem) {
        return {
            isValid: false,
            error: {
                code: 'invalid-bmi-template',
                message: 'BMI template must have a bmi-calculation group item'
            }
        };
    }
    var heightItem = (_e = bmiCalculationItem.item) === null || _e === void 0 ? void 0 : _e.find(function (item) { return item.linkId === 'patient-height'; });
    var weightItem = (_f = bmiCalculationItem.item) === null || _f === void 0 ? void 0 : _f.find(function (item) { return item.linkId === 'patient-weight'; });
    var bmiItem = (_g = bmiCalculationItem.item) === null || _g === void 0 ? void 0 : _g.find(function (item) { return item.linkId === 'bmi-result'; });
    if (!heightItem || !weightItem || !bmiItem) {
        return {
            isValid: false,
            error: {
                code: 'invalid-bmi-template',
                message: 'BMI template must have height, weight, and BMI result items'
            }
        };
    }
    // Check for template references
    var hasHeightTemplate = (_h = heightItem.extension) === null || _h === void 0 ? void 0 : _h.some(function (ext) {
        var _a;
        return ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
            ((_a = ext.valueReference) === null || _a === void 0 ? void 0 : _a.reference) === '#height-obs';
    });
    var hasWeightTemplate = (_j = weightItem.extension) === null || _j === void 0 ? void 0 : _j.some(function (ext) {
        var _a;
        return ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
            ((_a = ext.valueReference) === null || _a === void 0 ? void 0 : _a.reference) === '#weight-obs';
    });
    var hasBMITemplate = (_k = bmiItem.extension) === null || _k === void 0 ? void 0 : _k.some(function (ext) {
        var _a;
        return ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
            ((_a = ext.valueReference) === null || _a === void 0 ? void 0 : _a.reference) === '#bmi-obs';
    });
    if (!hasHeightTemplate || !hasWeightTemplate || !hasBMITemplate) {
        return {
            isValid: false,
            error: {
                code: 'invalid-bmi-template',
                message: 'BMI template items must have correct observation template references'
            }
        };
    }
    return {
        isValid: true,
        templates: [heightObs, weightObs, bmiObs]
    };
}
function isBMITemplate(questionnaire) {
    var _a, _b, _c, _d;
    // Check for BMI-specific observations
    var hasBMIObservation = (_b = (_a = questionnaire.contained) === null || _a === void 0 ? void 0 : _a.some(function (obs) {
        var _a, _b, _c;
        return obs.resourceType === 'Observation' &&
            (((_c = (_b = (_a = obs.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.code) === '39156-5' || // BMI code
                obs.id === 'obs-bmi-result');
    } // Check for BMI result observation by ID
    )) !== null && _b !== void 0 ? _b : false;
    // Check for BMI-specific items
    var hasBMIItems = (_d = (_c = questionnaire.item) === null || _c === void 0 ? void 0 : _c.some(function (item) {
        var _a;
        // Check for direct items
        return (item.linkId === 'height' || item.linkId === 'weight') ||
            (
            // Check for nested items
            (_a = item.item) === null || _a === void 0 ? void 0 : _a.some(function (subItem) { return subItem.linkId === 'patient-height' ||
                subItem.linkId === 'patient-weight' ||
                subItem.linkId === 'bmi-result'; }));
    })) !== null && _d !== void 0 ? _d : false;
    return hasBMIObservation && hasBMIItems;
}
function isBloodPressureTemplate(questionnaire) {
    var _a, _b, _c, _d;
    // Check for blood pressure specific observations
    var hasBPObservations = (_b = (_a = questionnaire.contained) === null || _a === void 0 ? void 0 : _a.some(function (obs) {
        var _a, _b, _c, _d, _e, _f;
        return obs.resourceType === 'Observation' &&
            (((_c = (_b = (_a = obs.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.code) === '8480-6' || // Systolic
                ((_f = (_e = (_d = obs.code) === null || _d === void 0 ? void 0 : _d.coding) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.code) === '8462-4');
    } // Diastolic
    )) !== null && _b !== void 0 ? _b : false;
    // Check for blood pressure specific items
    var hasBPItems = (_d = (_c = questionnaire.item) === null || _c === void 0 ? void 0 : _c.some(function (item) { return item.linkId === 'systolic' || item.linkId === 'diastolic'; })) !== null && _d !== void 0 ? _d : false;
    return hasBPObservations && hasBPItems;
}
function validateBloodPressureTemplate(questionnaire) {
    var _a, _b, _c, _d, _e, _f;
    // Check for required contained observations
    var systolicObs = (_a = questionnaire.contained) === null || _a === void 0 ? void 0 : _a.find(function (obs) { var _a, _b, _c; return obs.resourceType === 'Observation' && ((_c = (_b = (_a = obs.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.code) === '8480-6'; });
    var diastolicObs = (_b = questionnaire.contained) === null || _b === void 0 ? void 0 : _b.find(function (obs) { var _a, _b, _c; return obs.resourceType === 'Observation' && ((_c = (_b = (_a = obs.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.code) === '8462-4'; });
    if (!systolicObs || !diastolicObs) {
        return {
            isValid: false,
            error: {
                code: 'invalid-bp-template',
                message: 'Blood pressure template must contain systolic and diastolic observations'
            }
        };
    }
    // Check for required items
    var systolicItem = (_c = questionnaire.item) === null || _c === void 0 ? void 0 : _c.find(function (item) { return item.linkId === 'systolic'; });
    var diastolicItem = (_d = questionnaire.item) === null || _d === void 0 ? void 0 : _d.find(function (item) { return item.linkId === 'diastolic'; });
    if (!systolicItem || !diastolicItem) {
        return {
            isValid: false,
            error: {
                code: 'invalid-bp-template',
                message: 'Blood pressure template must have systolic and diastolic items'
            }
        };
    }
    // Check for template references
    var hasSystolicTemplate = (_e = systolicItem.extension) === null || _e === void 0 ? void 0 : _e.some(function (ext) {
        var _a;
        return ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
            ((_a = ext.valueReference) === null || _a === void 0 ? void 0 : _a.reference) === "#".concat(systolicObs.id);
    });
    var hasDiastolicTemplate = (_f = diastolicItem.extension) === null || _f === void 0 ? void 0 : _f.some(function (ext) {
        var _a;
        return ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
            ((_a = ext.valueReference) === null || _a === void 0 ? void 0 : _a.reference) === "#".concat(diastolicObs.id);
    });
    if (!hasSystolicTemplate || !hasDiastolicTemplate) {
        return {
            isValid: false,
            error: {
                code: 'invalid-bp-template',
                message: 'Blood pressure template items must have correct observation template references'
            }
        };
    }
    return {
        isValid: true,
        templates: [systolicObs, diastolicObs]
    };
}
function extractTemplateObservations(questionnaire) {
    // First verify the profile
    var profileResult = verifyTemplateProfile(questionnaire);
    if (!profileResult.isValid) {
        return profileResult;
    }
    // Check if it's a blood pressure template first
    if (isBloodPressureTemplate(questionnaire)) {
        return validateBloodPressureTemplate(questionnaire);
    }
    // Then check if it's a BMI calculator template
    if (isBMITemplate(questionnaire)) {
        return validateBMITemplate(questionnaire);
    }
    // If no specific template type is matched, return error
    return {
        isValid: false,
        error: {
            code: 'invalid-template-type',
            message: 'Questionnaire must be either a blood pressure or BMI calculator template'
        }
    };
}
