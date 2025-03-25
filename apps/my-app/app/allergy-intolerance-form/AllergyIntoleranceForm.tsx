'use client';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/Select';
import { DatePicker } from '../components/DatePicker';

interface AllergyIntoleranceFormValues {
  patient: string;
  allergen: string;
  verificationStatus: string;
  clinicalStatus?: string;
  onsetDateTime?: Date;
  onsetAge?: number;
  onsetStart?: Date;
  onsetEnd?: Date;
  onsetRangeLow?: string;
  onsetRangeHigh?: string;
  reactionDescription?: string;
  reactionSeverity?: string;
}

const AllergyIntoleranceForm: React.FC = () => {
  const { handleSubmit, control, watch, setValue } = useForm<AllergyIntoleranceFormValues>();
  const [onsetType, setOnsetType] = useState<string | null>(null);

  const onSubmit = (data: AllergyIntoleranceFormValues) => {
    console.log('Submitted Data:', data);
    alert(JSON.stringify(data, null, 2));
  };

  const verificationStatus = watch('verificationStatus');

  return (
    <Card className="p-4 max-w-4xl mx-auto mt-8">
      <h1 className="text-xl font-bold mb-4">Allergy Intolerance Form</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Patient Information */}
          <div>
            <label className="block text-sm font-medium">Patient</label>
            <Controller
              name="patient"
              control={control}
              defaultValue=""
              render={({ field }) => <Input {...field} placeholder="Enter Patient Name or ID" />}
            />
          </div>

          {/* Allergy Details */}
          <div>
            <label className="block text-sm font-medium">Allergen</label>
            <Controller
              name="allergen"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input {...field} placeholder="Enter allergen (e.g., peanuts)" />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Verification Status</label>
            <Controller
              name="verificationStatus"
              control={control}
              defaultValue="unconfirmed"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Verification Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="refuted">Refuted</SelectItem>
                    <SelectItem value="entered-in-error">Entered in Error</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {verificationStatus !== 'entered-in-error' && (
            <div>
              <label className="block text-sm font-medium">Clinical Status</label>
              <Controller
                name="clinicalStatus"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Clinical Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Onset Details */}
          <div>
            <label className="block text-sm font-medium">Onset Type</label>
            <Select onValueChange={(value) => setOnsetType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Onset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateTime">Date/Time</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="period">Period</SelectItem>
                <SelectItem value="range">Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {onsetType === 'dateTime' && (
            <div>
              <label className="block text-sm font-medium">Onset Date/Time</label>
              <Controller
                name="onsetDateTime"
                control={control}
                render={({ field }) => <DatePicker onChange={field.onChange} />}
              />
            </div>
          )}

          {onsetType === 'age' && (
            <div>
              <label className="block text-sm font-medium">Onset Age (in years)</label>
              <Controller
                name="onsetAge"
                control={control}
                defaultValue={0}
                render={({ field }) => <Input type="number" {...field} placeholder="Enter Age" />}
              />
            </div>
          )}

          {onsetType === 'period' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Onset Period</label>
              <Controller
                name="onsetStart"
                control={control}
                render={({ field }) => (
                  <DatePicker placeholder="Start Date" onChange={field.onChange} />
                )}
              />
              <Controller
                name="onsetEnd"
                control={control}
                render={({ field }) => (
                  <DatePicker placeholder="End Date" onChange={field.onChange} />
                )}
              />
            </div>
          )}

          {onsetType === 'range' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Onset Range</label>
              <Controller
                name="onsetRangeLow"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Enter Lower Range" />}
              />
              <Controller
                name="onsetRangeHigh"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Enter Upper Range" />}
              />
            </div>
          )}

          {/* Reaction Details */}
          <div>
            <label className="block text-sm font-medium">Reaction Description</label>
            <Controller
              name="reactionDescription"
              control={control}
              render={({ field }) => <Textarea {...field} placeholder="Describe the reaction" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Reaction Severity</label>
            <Controller
              name="reactionSeverity"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>

        <div className="mt-6">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Card>
  );
};

export default AllergyIntoleranceForm;
