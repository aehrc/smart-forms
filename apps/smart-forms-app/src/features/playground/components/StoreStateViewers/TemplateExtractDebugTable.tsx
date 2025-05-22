import type {
  TemplateExtractDebugInfo,
  TemplateExtractPathJsObject
} from '@aehrc/sdc-template-extract';
import { logTemplateExtractPathMapJsObjectFull } from '@aehrc/sdc-template-extract';
import '../../styles/debugTable.css';
import { Button } from '@mui/material';

interface TemplateExtractDebugTableProps {
  templateExtractDebugInfo: TemplateExtractDebugInfo;
}

function TemplateExtractDebugTable(props: TemplateExtractDebugTableProps) {
  const { templateExtractDebugInfo } = props;
  const templateIdToExtractPaths: Record<
    string,
    Record<string, TemplateExtractPathJsObject>
  > = templateExtractDebugInfo.templateIdToExtractPaths;

  return (
    <>
      {Object.entries(templateIdToExtractPaths).map(([templateId, templateExtractPaths]) => {
        const rows: {
          index: number;
          entryPath: string;
          contextPath: string | null;
          contextExpression: string | null;
          contextResult: string | null;
          valuePath: string | null;
          valueExpression: string | null;
          valueResult: string | null;
        }[] = [];

        let index = 0;
        for (const [entryPath, templateExtractPath] of Object.entries(templateExtractPaths)) {
          const contextPath = templateExtractPath.contextPathTuple?.[0] ?? null;
          const contextExpression =
            templateExtractPath.contextPathTuple?.[1]?.contextExpression ?? null;
          const contextResult = templateExtractPath.contextPathTuple?.[1]?.contextResult ?? null;

          const valueMap = templateExtractPath.valuePathMap ?? {};
          const valuePaths = Object.entries(valueMap);

          if (valuePaths.length === 0) {
            rows.push({
              index: index++,
              entryPath,
              contextPath,
              contextExpression,
              contextResult: JSON.stringify(contextResult),
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
                contextResult: JSON.stringify(contextResult),
                valuePath,
                valueExpression,
                valueResult: JSON.stringify(valueResult)
              });
            }
          }
        }

        return (
          <div key={templateId} style={{ marginBottom: '2rem' }}>
            <h3>
              Template <b>{templateId}</b> contexts and values
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="console-table">
                <thead>
                  <tr>
                    <th>index</th>
                    <th>entryPath</th>
                    <th>contextPath</th>
                    <th>contextExpression</th>
                    <th>contextResult</th>
                    <th>valuePath</th>
                    <th>valueExpression</th>
                    <th>valueResult</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.index}>
                      <td>{row.index}</td>
                      <td>{row.entryPath}</td>
                      <td>{row.contextPath}</td>
                      <td>{row.contextExpression}</td>
                      <td>{row.contextResult}</td>
                      <td>{row.valuePath}</td>
                      <td>{row.valueExpression}</td>
                      <td>{row.valueResult}</td>
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
      })}
    </>
  );
}

export default TemplateExtractDebugTable;
