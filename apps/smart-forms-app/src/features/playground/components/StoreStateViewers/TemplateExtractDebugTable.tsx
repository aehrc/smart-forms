import type {
  TemplateExtractDebugInfo,
  TemplateExtractPathJsObject
} from '@aehrc/sdc-template-extract';
import '../../styles/debugTable.css';

interface TemplateExtractDebugTableProps {
  templateExtractDebugInfo: TemplateExtractDebugInfo;
}

function TemplateExtractDebugTable(props: TemplateExtractDebugTableProps) {
  const { templateExtractDebugInfo } = props;
  const templateIdToExtractPaths: Record<
    string,
    Record<string, TemplateExtractPathJsObject>
  > = templateExtractDebugInfo.templateIdToExtractPaths;

  const rows: {
    index: number;
    templateId: string;
    entryPath: string;
    contextPath: string | null;
    contextExpression: string | null;
    contextResult: string | null;
    valuePath: string | null;
    valueExpression: string | null;
    valueResult: string | null;
  }[] = [];

  let index = 0;
  for (const [templateId, templateExtractPaths] of Object.entries(templateIdToExtractPaths)) {
    for (const [entryPath, templateExtractPath] of Object.entries(templateExtractPaths)) {
      const contextPath = templateExtractPath.contextPathTuple?.[0] ?? null;
      const contextExpression =
        templateExtractPath.contextPathTuple?.[1]?.contextExpression ?? null;
      const contextResult = templateExtractPath.contextPathTuple?.[1]?.contextResult ?? null;

      if (Object.keys(templateExtractPath.valuePathMap).length === 0) {
        rows.push({
          index: index++,
          templateId,
          entryPath,
          contextPath,
          contextExpression,
          contextResult: JSON.stringify(contextResult),
          valuePath: null,
          valueExpression: null,
          valueResult: null
        });
      } else {
        for (const [valuePath, valueEvaluation] of Object.entries(
          templateExtractPath.valuePathMap
        )) {
          const { valueExpression, valueResult } = valueEvaluation;
          rows.push({
            index: index++,
            templateId,
            entryPath,
            contextPath,
            contextExpression,
            contextResult: JSON.stringify(contextResult),
            valuePath: valuePath,
            valueExpression: valueExpression,
            valueResult: JSON.stringify(valueResult)
          });
        }
      }
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="console-table">
        <thead>
          <tr>
            <th>index</th>
            <th>templateId</th>
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
              <td>{row.templateId}</td>
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
  );
}

export default TemplateExtractDebugTable;
