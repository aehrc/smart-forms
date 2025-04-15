import { extractTemplateBased } from '../utils/extractTemplate';
import { complexTemplateQuestionnaire, complexTemplateResponse } from './test-data/complexTemplateSample';

describe('extractTemplateBased for complex templates', () => {
  it('should extract observations from complex template', async () => {
    const { result } = await extractTemplateBased(complexTemplateQuestionnaire, complexTemplateResponse);
    expect(result).toBeDefined();
    expect(result).toHaveLength(2);

    const heightObs = result?.find(obs => 
      obs.code?.coding?.[0]?.code === '8302-2'
    );
    expect(heightObs).toBeDefined();
    if (heightObs?.valueQuantity) {
      expect(heightObs.valueQuantity.value).toBe(159); // Height is already in cm so no conversion
      expect(heightObs.valueQuantity.unit).toBe('cm');
    }

    const weightObs = result?.find(obs => 
      obs.code?.coding?.[0]?.code === '29463-7'
    );
    expect(weightObs).toBeDefined();
    if (weightObs?.valueQuantity) {
      expect(weightObs.valueQuantity.value).toBe(75);
      expect(weightObs.valueQuantity.unit).toBe('kg');
    }
  });

  it('should extract observations from complex template with detailed debug info', async () => {
    const { result, debugInfo } = await extractTemplateBased(complexTemplateQuestionnaire, complexTemplateResponse);
    
    // Check debug info
    expect(debugInfo).toBeDefined();
    expect(debugInfo.contentAnalysis.patterns).toContain('Patient: patTemplate');
    expect(debugInfo.contentAnalysis.patterns).toContain('Observation: obsTemplateHeight');
    expect(debugInfo.contentAnalysis.patterns).toContain('Observation: obsTemplateWeight');

    // Check height observation
    const heightObs = result?.find(obs => 
      obs.code?.coding?.[0]?.code === '8302-2'
    );
    expect(heightObs).toBeDefined();
    if (heightObs?.valueQuantity) {
      expect(heightObs.valueQuantity.value).toBe(159); // Height is already in cm so no conversion
      expect(heightObs.valueQuantity.unit).toBe('cm');
    }

    // Check weight observation
    const weightObs = result?.find(obs => 
      obs.code?.coding?.[0]?.code === '29463-7'
    );
    expect(weightObs).toBeDefined();
    if (weightObs?.valueQuantity) {
      expect(weightObs.valueQuantity.value).toBe(75);
      expect(weightObs.valueQuantity.unit).toBe('kg');
    }

    // Check transformations
    expect(debugInfo.valueProcessing.transformations).toContain('Height value 159 appears to already be in cm, no conversion needed for obsTemplateHeight');
    expect(debugInfo.valueProcessing.transformations).toContain('Extracted value 75 for obsTemplateWeight');
  });

  it('should generate correct debug output for complex template extraction', async () => {
    const { result, debugInfo } = await extractTemplateBased(complexTemplateQuestionnaire, complexTemplateResponse);
    
    // Verify debug info structure
    expect(debugInfo).toBeDefined();
    expect(debugInfo.contentAnalysis).toBeDefined();
    expect(debugInfo.fieldMapping).toBeDefined();
    expect(debugInfo.valueProcessing).toBeDefined();
    expect(debugInfo.resultGeneration).toBeDefined();

    // Verify content analysis
    expect(debugInfo.contentAnalysis.detectedTemplates).toContain('obsTemplateHeight');
    expect(debugInfo.contentAnalysis.detectedTemplates).toContain('obsTemplateWeight');
    expect(debugInfo.contentAnalysis.confidence).toBe('Valid');
    expect(debugInfo.contentAnalysis.patterns).toContain('Observation: obsTemplateHeight');
    expect(debugInfo.contentAnalysis.patterns).toContain('Observation: obsTemplateWeight');

    // Verify field mapping with new expected structure
    expect(debugInfo.fieldMapping.mappedFields).toHaveProperty('8302-2');
    expect(debugInfo.fieldMapping.mappedFields).toHaveProperty('29463-7');
    expect(debugInfo.fieldMapping.mappedFields['8302-2']).toMatchObject({
      templateId: 'obsTemplateHeight',
      type: 'Observation',
      valuePath: "item.where(linkId='obs').item.where(linkId='height').answer.valueDecimal"
    });
    expect(debugInfo.fieldMapping.mappedFields['29463-7']).toMatchObject({
      templateId: 'obsTemplateWeight',
      type: 'Observation',
      valuePath: "item.where(linkId='obs').item.where(linkId='weight').answer.valueDecimal"
    });
    
    // Verify value processing
    expect(debugInfo.valueProcessing.values).toHaveProperty('obsTemplateHeight', 159);
    expect(debugInfo.valueProcessing.values).toHaveProperty('obsTemplateWeight', 75);
    expect(debugInfo.valueProcessing.transformations).toContain('Height value 159 appears to already be in cm, no conversion needed for obsTemplateHeight');
    expect(debugInfo.valueProcessing.transformations).toContain('Extracted value 75 for obsTemplateWeight');
    
    // Verify height check exists, but don't check exact structure as it may vary
    const heightCheck = debugInfo.valueProcessing.qualityChecks.find(
      check => check.check && check.check.includes('Height value in reasonable range')
    );
    expect(heightCheck).toBeDefined();
    
    // Verify observations
    const heightObs = result?.find(obs => obs.code?.coding?.[0]?.code === '8302-2');
    const weightObs = result?.find(obs => obs.code?.coding?.[0]?.code === '29463-7');

    expect(heightObs).toBeDefined();
    expect(weightObs).toBeDefined();
    expect(heightObs?.valueQuantity?.value).toBe(159);
    expect(heightObs?.valueQuantity?.unit).toBe('cm');
    expect(weightObs?.valueQuantity?.value).toBe(75);
    expect(weightObs?.valueQuantity?.unit).toBe('kg');
  });
}); 