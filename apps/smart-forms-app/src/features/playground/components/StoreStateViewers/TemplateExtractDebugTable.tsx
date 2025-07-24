import type {
  TemplateExtractDebugInfo,
  TemplateExtractPathJsObjectTuple
} from '@aehrc/sdc-template-extract';
import { logTemplateExtractPathMapJsObjectFull } from '@aehrc/sdc-template-extract';
import '../../styles/debugTable.css';
import { Fragment } from 'react';
import { Button } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface TemplateExtractDebugTableProps {
  templateExtractDebugInfo: TemplateExtractDebugInfo;
}

function TemplateExtractDebugTable(props: TemplateExtractDebugTableProps) {
  const { templateExtractDebugInfo } = props;
  const templateIdToExtractPathTuples: Record<string, TemplateExtractPathJsObjectTuple[]> =
    templateExtractDebugInfo.templateIdToExtractPathTuples;

  return (
    <>
      {Object.entries(templateIdToExtractPathTuples).map(
        ([templateId, templateExtractPathTupleInstances]) =>
          templateExtractPathTupleInstances.map(
            ([fullUrl, templateExtractPaths], instanceIndex) => {
              const rows: {
                index: number;
                entryPath: string;
                contextPath: string | null;
                contextExpression: string | null;
                valuePath: string | null;
                valueExpression: string | null;
                valueResult: any | null;
              }[] = [];

              let index = 0;
              for (const [entryPath, templateExtractPath] of Object.entries(templateExtractPaths)) {
                const contextPath = templateExtractPath.contextPathTuple?.[0] ?? null;
                const contextExpression = templateExtractPath.contextPathTuple?.[1] ?? null;

                const valueMap = templateExtractPath.valuePathMap ?? {};
                const valuePaths = Object.entries(valueMap);

                if (valuePaths.length === 0) {
                  rows.push({
                    index: index++,
                    entryPath,
                    contextPath,
                    contextExpression,
                    valuePath: null,
                    valueExpression: null,
                    valueResult: null
                  });
                } else {
                  for (const [valuePath, { valueExpression, valueResult }] of valuePaths) {
                    rows.push({
                      index: index++,
                      entryPath,
                      contextPath,
                      contextExpression,
                      valuePath,
                      valueExpression,
                      valueResult
                    });
                  }
                }
              }

              return (
                <div key={`${templateId}-${fullUrl}`} style={{ marginBottom: '2rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <b>{templateId}</b> [{fullUrl ?? `#${instanceIndex + 1}`}] contexts and values
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="console-table">
                      <thead>
                        <tr>
                          <th>entryPath</th>
                          <th>contextExpression</th>
                          <th>valueExpression</th>
                          <th>valueResult</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.index}>
                            <td>{renderFhirPathMultiline(row.entryPath)}</td>
                            <td>{renderFhirPathMultiline(row.contextExpression)}</td>
                            <td>{renderFhirPathMultiline(row.valueExpression)}</td>
                            <td>
                              {row.valueResult ? (
                                <SyntaxHighlighter
                                  data-test="debug-viewer"
                                  language="json"
                                  customStyle={{
                                    maxWidth: '300px',
                                    fontSize: 9.5,
                                    backgroundColor: 'white'
                                  }}>
                                  {JSON.stringify(row.valueResult, null, 2)}
                                </SyntaxHighlighter>
                              ) : (
                                <pre>{null}</pre>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button
                    onClick={() => {
                      logTemplateExtractPathMapJsObjectFull(templateId, templateExtractPaths);
                    }}>
                    Log table to console
                  </Button>
                </div>
              );
            }
          )
      )}
    </>
  );
}

export default TemplateExtractDebugTable;

/**
 * Splits a FHIRPath string by dot (.) and renders each part on a new line.
 *
 * @param path - The FHIRPath string.
 * @returns Multiline JSX output.
 */
function renderFhirPathMultiline(path: string | null) {
  if (!path) {
    return null;
  }

  const segments = path.split('.');
  return (
    <>
      {segments.map((seg, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {index > 0 && '.'}
          {seg}
        </Fragment>
      ))}
    </>
  );
}
