type JsonLdData = Record<string, unknown>;

interface Props {
  data: JsonLdData | JsonLdData[];
}

export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
