// app/chat/PreviewPanel.tsx
export async function PreviewPanel(props: { preview?: any }) {
  const { preview } = props;
  return (
    <div className="h-full w-full border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
      <span>
        <p className="text-lg font-medium">🔍 Preview Panel</p>
        <p className="text-sm mt-2">
          This area could display dynamic results or context.
        </p>

        <div className="mt-4 p-2border rounded">
          <pre>{JSON.stringify(preview, null, 2)}</pre>
        </div>
      </span>
    </div>
  );
}
