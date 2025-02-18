import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  TextField,
  TablePagination,
  Tooltip,
} from '@material-ui/core';
import { useEnvironments, useProject, useReleases } from '../../state';
import { formatDistanceToNow } from 'date-fns';
import { Link } from '@mui/icons-material';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getFacetsConfig } from '../..';
import SmartTableLinkListComponent from './SmartTableLinkListComponent';

export const ReleaseHistoryCard = () => {
  const { entity } = useEntity();
  const { configExists, project, resourceType, resourceName } =
    getFacetsConfig(entity);
  const [{ vcsUrl }] = useProject({ name: project });
  const [{ environments, loading, selectedEnv }, { selectEnvironment }] =
    useEnvironments({ project });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterReleaseType, setFilterReleaseType] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const handleChangePage = (
    _event: any,
    newPage: React.SetStateAction<number>,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: { target: { value: string } }) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [{ releases, loading: loadingReleases, cpUrl }, { triggerRelease }] =
    useReleases({
      environmentId: selectedEnv,
      resourceType,
      resourceName,
    });

  const handleReleaseNow = () => {
    triggerRelease();
  };

  const handleSelectEnv = (e: any) => {
    const envId = e.target.value;
    selectEnvironment(envId);
    localStorage.setItem('facets_current_env', envId);
    window.dispatchEvent(
      new CustomEvent('envChange', {
        detail: { key: 'newEnv', value: envId },
      }),
    );
  };

  const filteredData = releases
    ?.filter((row: any) =>
      row.releaseDetails.triggeredBy
        .toLowerCase()
        .includes(filterSearch.toLowerCase()),
    )
    ?.filter((row: any) =>
      filterReleaseType
        ? row.releaseDetails.releaseType === filterReleaseType
        : true,
    );

  // Listen for environment changes
  useEffect(() => {
    const handleStorageChange = (event: any) => {
      if (event.detail.key === 'newEnv' && event.detail.value !== selectedEnv) {
        selectEnvironment(event.detail.value); // Update the environment
      }
    };

    window.addEventListener('envChange', handleStorageChange);

    // Cleanup listener
    return () => {
      window.removeEventListener('envChange', handleStorageChange);
    };
  }, [selectEnvironment, selectedEnv]);

  return (
    <Card>
      <CardHeader
        title="Release History"
        subheader="Powered by Facets.Cloud"
        action={
          <CardActions>
            {environments?.length ? (
              <div
                style={{ display: 'flex', justifyContent: 'center', gap: 8 }}
              >
                <Select
                  value={selectedEnv}
                  onChange={handleSelectEnv}
                  displayEmpty
                  style={{ width: '140px' }}
                >
                  {environments?.map((env: any) => (
                    <MenuItem key={env.id} value={env.id}>
                      {env.name}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  key="release"
                  disabled={loading || loadingReleases || !environments.length}
                  onClick={handleReleaseNow}
                >
                  Release Now
                </Button>
              </div>
            ) : (
              ''
            )}
          </CardActions>
        }
      />
      {configExists ? (
        <CardContent>
          {loading || loadingReleases ? (
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
            <Paper>
              <div style={{ padding: '16px' }}>
                <TextField
                  label="Search by Triggered By"
                  variant="outlined"
                  size="small"
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  style={{ marginRight: '16px' }}
                />
                <Select
                  value={filterReleaseType}
                  onChange={(e: any) => setFilterReleaseType(e.target.value)}
                  displayEmpty
                  style={{ width: '150px' }}
                >
                  <MenuItem value="">All Release Types</MenuItem>
                  <MenuItem value="RELEASE">Release</MenuItem>
                  <MenuItem value="HOTFIX">Hotfix</MenuItem>
                </Select>
              </div>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Triggered</TableCell>
                      <TableCell>Commit ID</TableCell>
                      <TableCell>Release Type</TableCell>
                      <TableCell>Change Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((row: any) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Tooltip title={row.releaseDetails.triggeredOn}>
                              <span>{`${
                                row.releaseDetails.triggeredBy
                              } - ${formatDistanceToNow(
                                new Date(row.releaseDetails.triggeredOn),
                              )} ago`}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`${vcsUrl}/commit/${row.releaseDetails.stackVersion}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontWeight: 'bold',
                                color: 'orange',
                              }}
                            >
                              {row.releaseDetails.stackVersion.slice(0, 7)}
                            </a>
                          </TableCell>
                          <TableCell>
                            {row.releaseDetails.releaseType}
                          </TableCell>
                          <TableCell>
                            <SmartTableLinkListComponent
                              changes={row.changes}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Release Details">
                              <Button size="small">
                                <a
                                  href={`${cpUrl}/capc/stack/${project}/releases/cluster/${selectedEnv}/dialog/release-details/${row?.releaseDetails?.deploymentLogId}`}
                                  target="_blank"
                                >
                                  <Link />
                                </a>
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}
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
