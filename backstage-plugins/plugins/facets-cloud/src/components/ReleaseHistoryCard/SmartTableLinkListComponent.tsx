import React from 'react';

const SmartTableLinkListComponent = ({ changes }: { changes: any[] }) => {
  const attributeTypeMap: Record<
    'commitId' | 'overrideVersion' | 'artifactUrl',
    string
  > = {
    commitId: 'BLUEPRINT',
    overrideVersion: 'OVERRIDE',
    artifactUrl: 'ARTIFACT',
  };

  return (
    <div>
      {changes?.map((change, index) => {
        const attribute = change?.changedAttribute
          ?.attribute as keyof typeof attributeTypeMap;

        return (
          <div key={index} className={`mt-${index !== 0 ? 2 : 0}`}>
            <span
              style={{
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                color: 'var(--custom-badge-primary-color)',
                backgroundColor: 'var(--custom-badge-primary-background-color)',
                borderColor: 'var(--custom-badge-primary-border-color)',
                padding: '0.25em 0.5em',
                borderRadius: '12px',
                display: 'inline-block',
                fontWeight: 'bold',
              }}
            >
              {attributeTypeMap[attribute] || 'Unknown'}
            </span>
            {' - '}
            <span style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {change?.changeType}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SmartTableLinkListComponent;
