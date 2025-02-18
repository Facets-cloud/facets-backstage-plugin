import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  Typography,
  Chip,
  Tooltip,
} from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useEnvironmentOverview, useProject } from '../../state';
import { getFacetsConfig } from '../..';
import { WatchLaterOutlined, ElectricBoltOutlined } from '@mui/icons-material';

export const EnvironmentOverviewCard = () => {
  const { entity } = useEntity();
  const { configExists, project, resourceType, resourceName } =
    getFacetsConfig(entity);

  const [{ overview, loading }] = useEnvironmentOverview({
    project,
    resourceType,
    resourceName,
  });
  const [{ vcsUrl }] = useProject({ name: project });
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const rows =
    overview?.map((env: any) => ({
      name: env.clusterName,
      status: env.disabled ? 'DISABLED' : 'ENABLED',
      overridden: env.overridden ? 'OVERRIDDEN' : 'NO CHANGE',
      id: env.clusterId,
      buildRegisteredLive: env.artifactVersion?.liveVersion || '',
      buildRegisteredPending: env.artifactVersion?.pendingVersion || '',
      blueprintLastCommitLive: env.blueprintVersion?.liveCommitId,
      blueprintLastCommitPending: env.blueprintVersion?.pendingCommitId,
      overridesVersionLive: env.overrideVersion?.liveVersion || '',
      overridesVersionPending: env.overrideVersion?.pendingVersion || '',
    })) || [];

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };
  return (
    <Card>
      <CardHeader
        title="Environment Overview"
        subheader="Powered by Facets.Cloud"
      />
      {configExists ? (
        <CardContent>
          <TableContainer component={Paper}>
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '20px',
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Resource Status</TableCell>
                    <TableCell>Resource Overridden</TableCell>
                    <TableCell>Build Registered Version</TableCell>
                    <TableCell>Blueprint Last Commit</TableCell>
                    <TableCell>Overrides Version</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows
                    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                    .map(env => (
                      <TableRow key={env.id}>
                        <TableCell component="th" scope="row">
                          {env.name}
                        </TableCell>
                        <TableCell
                          style={{
                            color:
                              env.status.toLowerCase() === 'enabled'
                                ? '#1eb75a'
                                : '#da1414',
                          }}
                        >
                          {env.status}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={env.overridden}
                            size="small"
                            color="primary"
                            disabled={env.overridden === 'NO CHANGE'}
                          />
                        </TableCell>
                        <TableCell>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            {env.buildRegisteredPending && (
                              <Tooltip
                                title="Release Pending"
                                arrow
                                placement="top"
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                  }}
                                >
                                  <WatchLaterOutlined
                                    style={{ color: 'orange', fontSize: '14' }}
                                  />
                                  <span>{env.buildRegisteredPending}</span>
                                </div>
                              </Tooltip>
                            )}
                            {env.buildRegisteredLive && (
                              <Tooltip title="Live Build" arrow placement="top">
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                  }}
                                >
                                  {env.buildRegisteredPending ? (
                                    <>
                                      (
                                      <ElectricBoltOutlined
                                        style={{
                                          color: 'green',
                                          fontSize: '14',
                                        }}
                                      />
                                      <span>{env.buildRegisteredLive}</span>)
                                    </>
                                  ) : (
                                    <>
                                      <ElectricBoltOutlined
                                        style={{
                                          color: 'green',
                                          fontSize: '14',
                                        }}
                                      />
                                      <span>{env.buildRegisteredLive}</span>
                                    </>
                                  )}
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            {/* Pending Value */}
                            {env.blueprintLastCommitPending && (
                              <Tooltip
                                title="Release Pending"
                                arrow
                                placement="top"
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                  }}
                                >
                                  <a
                                    href={`${vcsUrl}/commit/${env.blueprintLastCommitPending}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontWeight: 'bold',
                                      color: 'orange',
                                    }}
                                  >
                                    {env.blueprintLastCommitPending.substring(
                                      0,
                                      7,
                                    )}
                                  </a>
                                  <WatchLaterOutlined
                                    style={{ color: 'orange', fontSize: '14' }}
                                  />
                                </div>
                              </Tooltip>
                            )}
                            {/* Live Value */}
                            {env.blueprintLastCommitLive && (
                              <Tooltip title="Live Build" arrow placement="top">
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                  }}
                                >
                                  {env.blueprintLastCommitPending ? (
                                    <>
                                      (
                                      <a
                                        href={`${vcsUrl}/commit/${env.blueprintLastCommitLive}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          fontWeight: 'bold',
                                          color: 'white',
                                        }}
                                      >
                                        {env.blueprintLastCommitLive.substring(
                                          0,
                                          7,
                                        )}
                                      </a>
                                      <ElectricBoltOutlined
                                        style={{
                                          color: 'green',
                                          fontSize: '14',
                                        }}
                                      />
                                      )
                                    </>
                                  ) : (
                                    <>
                                      <a
                                        href={`${vcsUrl}/commit/${env.blueprintLastCommitLive}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          fontWeight: 'bold',
                                          color: 'white',
                                        }}
                                      >
                                        {env.blueprintLastCommitLive.substring(
                                          0,
                                          7,
                                        )}
                                      </a>
                                      <ElectricBoltOutlined
                                        style={{
                                          color: 'green',
                                          fontSize: '14',
                                        }}
                                      />
                                    </>
                                  )}
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            {env.overridesVersionPending && (
                              <Tooltip
                                title="Release Pending"
                                arrow
                                placement="top"
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                  }}
                                >
                                  <WatchLaterOutlined
                                    style={{ color: 'orange', fontSize: '14' }}
                                  />
                                  <span>{env.overridesVersionPending}</span>
                                </div>
                              </Tooltip>
                            )}
                            {env.overridesVersionLive && (
                              <Tooltip title="Live Build" arrow placement="top">
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                  }}
                                >
                                  {env.overridesVersionPending ? (
                                    <>
                                      (
                                      <ElectricBoltOutlined
                                        style={{
                                          color: 'green',
                                          fontSize: '14',
                                        }}
                                      />
                                      <span>{env.overridesVersionLive}</span>)
                                    </>
                                  ) : (
                                    <>
                                      <ElectricBoltOutlined
                                        style={{
                                          color: 'green',
                                          fontSize: '14',
                                        }}
                                      />
                                      <span>{env.overridesVersionLive}</span>
                                    </>
                                  )}
                                </div>
                              </Tooltip>
                            )}
                            {env.overridesVersionLive === '' &&
                            env.overridesVersionPending === ''
                              ? '-'
                              : ''}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      ) : (
        <CardContent>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <Typography>
              <h3>Missing Facets.Cloud annotations!</h3>
            </Typography>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
