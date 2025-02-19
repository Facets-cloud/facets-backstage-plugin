import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  Typography,
  CardActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Snackbar,
  Paper,
} from '@material-ui/core';
import { ContentCopy, AttachMoney } from '@mui/icons-material';
import { useEnvironments } from '../../state';
import { getFacetsConfig } from '../..';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useResourceProperties } from '../../state/useResourceProperties';
import RouterLink from './RouterLink';

export const TerraformOutputCard = () => {
  // can view password or not is determined by user permission in Facets
  const { entity } = useEntity();
  const { configExists, project, resourceType, resourceName } =
    getFacetsConfig(entity);
  const [{ environments, loading, selectedEnv }, { selectEnvironment }] =
    useEnvironments({ project });

  const [{ attributes, interfaces, loading: loadingResourceProperties }] =
    useResourceProperties({
      environmentId: selectedEnv,
      resourceType,
      resourceName,
    });

  const [interfaceData, setInterfaceData] = useState<any[]>();
  const [cumulativeInterfaceData, setCumulativeInterfaceData] = useState();
  const [attributeData, setAttributeData] = useState<
    {
      key: string;
      value: any;
      isSecret: any;
      type: 'interface' | 'attribute';
    }[]
  >();

  // TODO: Toggle password field using these
  const [showInterfacePassword, _setShowInterfacePassword] = useState(false);
  const [showAttributePassword, _setShowAttributePassword] = useState(false);
  // TODO: This comes from Facets user permissions
  const [hasPasswordViewPermission, _setHasPasswordViewPermission] =
    useState(false);
  const [interfaceInstances, setInterfaceInstances] =
    useState<{ label: string; value: string }[]>();
  const [selectedInterfaceInstance, setSelectedInterfaceInstance] =
    useState<string>('');

  const [open, setOpen] = useState(false);
  const [referenceVar, setReferenceVar] = useState<string | undefined>();
  const [openNotification, setOpenNotification] = useState(false);

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

  const handleClose = () => {
    setOpen(false);
    setReferenceVar(undefined);
  };

  const getKeyPath = (
    obj: Record<string, any>,
    targetKey: string,
    currentPath: string = '',
  ): string | null => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === targetKey) {
          return currentPath ? `${currentPath}.${key}` : key;
        }

        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          const nestedPath = getKeyPath(
            value,
            targetKey,
            currentPath ? `${currentPath}.${key}` : key,
          );
          if (nestedPath) {
            return nestedPath;
          }
        }
      }
    }

    return null;
  };

  const getReferenceVar = (key: string, type: 'interface' | 'attribute') => {
    let refVar = '';
    if (type === 'interface') {
      refVar = `\${${resourceType}.${resourceName}.out.interfaces.${selectedInterfaceInstance}.${key.toLowerCase()}}`;
    } else {
      refVar = `\${${resourceType}.${resourceName}.out.attributes.${getKeyPath(
        attributes,
        key,
      )}}`;
    }
    return refVar;
  };

  const showReferenceVariable = (
    key: string,
    type: 'interface' | 'attribute',
  ) => {
    const refVar = getReferenceVar(key, type);
    setReferenceVar(refVar);
    setOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setOpenNotification(true);
    });
  };

  const handleCloseSnack = () => {
    setOpenNotification(false);
  };

  useEffect(() => {
    const getValue = (
      key: any,
      value: any,
      secrets: string | any[],
      showPassword: any,
    ) => {
      if (secrets?.includes(key)) {
        if (hasPasswordViewPermission) {
          return showPassword ? value : '*****';
        }
        return '*****';
      }
      return value;
    };

    const constructTableData = (
      instance: any,
      type: 'interface' | 'attribute',
    ) => {
      const tableData: {
        key: string;
        value: any;
        isSecret: any;
        type: 'interface' | 'attribute';
      }[] = [];
      const secrets = instance?.secrets;
      Object.entries(instance).forEach(([key, value]) => {
        if (key !== 'secrets') {
          tableData.push({
            key: key,
            value: getValue(
              key,
              value,
              secrets,
              type === 'interface'
                ? showInterfacePassword
                : showAttributePassword,
            ),
            isSecret: secrets?.includes(key),
            type: type,
          });
        }
      });
      return tableData;
    };

    if (interfaces && Object.keys(interfaces)?.length > 0) {
      // Form dropdown based on keys in interfaces object and set first dropdown value as default selected.
      const options = Object.keys(interfaces).map(key => {
        return {
          label: key,
          value: key,
        };
      });
      setInterfaceInstances(options);
      setSelectedInterfaceInstance(options[0]?.value);

      const cumulativeInterfaceTableData: any = {};
      // Construct table data for all interfaces
      Object.keys(interfaces).forEach(key => {
        cumulativeInterfaceTableData[key] = constructTableData(
          interfaces[key],
          'interface',
        );
      });

      setCumulativeInterfaceData(cumulativeInterfaceTableData);
      setInterfaceData(cumulativeInterfaceTableData[selectedInterfaceInstance]);
    }

    if (attributes && Object.keys(attributes)?.length > 0) {
      const attrData = constructTableData(attributes, 'attribute');
      setAttributeData(attrData);
    }
  }, [
    attributes,
    hasPasswordViewPermission,
    interfaces,
    selectedInterfaceInstance,
    showAttributePassword,
    showInterfacePassword,
  ]);

  const areArrayKeysOfType = (arr: unknown[], type: string): boolean => {
    return arr.every(element => {
      if (type === 'string') {
        return typeof element === 'string';
      }
      if (type === 'object') {
        return (
          element !== null &&
          typeof element === 'object' &&
          !Array.isArray(element)
        );
      }
      return false; // Optional default case for unsupported types
    });
  };

  const areObjectKeysSameType = (obj: Record<string, unknown>): boolean => {
    const valueTypes = new Set<string>();

    Object.values(obj).forEach(value => {
      if (Array.isArray(value)) {
        valueTypes.add('array');
      } else if (value !== null && typeof value === 'object') {
        valueTypes.add('object');
      } else {
        valueTypes.add(typeof value);
      }
    });

    return valueTypes.size === 1;
  };

  const constructRouterLinkProps = (
    display: string,
    name: string,
    populateData: any,
    popupType = 'table',
  ) => {
    return {
      url: null,
      linkUnderline: true,
      display: display,
      extraData: {
        name: name,
        populateData: populateData,
        popupType: popupType,
      },
    };
  };

  const getComponentAndData = (
    value: any,
    key: string,
  ): { type: string; props: {} } => {
    let type = 'default';
    let props = {};

    // 1. Handle primitive values
    if (typeof value === 'string' || value === null || value === undefined) {
      // - String: Render as plain text
      // - null or undefined: Render as '-'
      props = {
        value: value || '-',
      };
    }
    // 2. Handle array values
    else if (Array.isArray(value)) {
      // - Empty array: Render as a stringified version
      if (value.length === 0) {
        props = {
          value: JSON.stringify(value),
        };
      }
      // - Array of strings: Convert each element to an object with 'name' and render as 'link-ellipsis'
      else if (areArrayKeysOfType(value, 'string')) {
        const cellCustomComponentData = value.map(element => ({
          name: element,
        }));
        type = 'link-ellipsis';
        props = {
          data: cellCustomComponentData,
          decorate: true,
          status: 'success',
          defaultDisplay: 3,
          showAsLink: false,
          dataObject: true,
        };
      }
      // - Array of objects: Merge all objects and render as 'router-link'
      else if (areArrayKeysOfType(value, 'object')) {
        const mergedObject = value.reduce(
          (acc, obj) => ({ ...acc, ...obj }),
          {},
        );
        type = 'router-link';
        props = constructRouterLinkProps('View List', key, mergedObject);
      }
    }
    // 3. Handle object values
    else if (typeof value === 'object') {
      const keys = Object.keys(value);

      // - Empty object: Render as a stringified version
      if (keys.length === 0) {
        props = {
          value: JSON.stringify(value),
        };
      }
      // - Object with mixed data types: Render as 'router-link' with 'json-editor'
      else if (!areObjectKeysSameType(value)) {
        type = 'router-link';
        props = constructRouterLinkProps(
          'View ' + `${key}`,
          key,
          value,
          'json-editor',
        );
      }
      // - Object with homogeneous types:
      else {
        const firstElement = value[keys[0]];

        // -- All string or array values: Render as 'router-link'
        if (typeof firstElement === 'string' || Array.isArray(firstElement)) {
          type = 'router-link';
          props = constructRouterLinkProps('View ' + `${key}`, key, value);
        }
        // -- All object values: Convert each key-value pair and render as 'link-ellipsis'
        else if (typeof firstElement === 'object') {
          const cellCustomComponentData = Object.entries(value)?.map(
            ([keyAlt, val]) => ({
              name: keyAlt,
              populateData: val,
              popupType: 'table',
            }),
          );
          type = 'link-ellipsis';
          props = {
            data: cellCustomComponentData,
            extraData: cellCustomComponentData,
            decorate: false,
            status: 'success',
            defaultDisplay: 3,
            showAsLink: true,
            dataObject: true,
            linkUnderline: true,
          };
        }
      }
    }

    return { type, props };
  };

  const handleInterfaceChange = (val: string) => {
    setSelectedInterfaceInstance(val);
    setInterfaceData(cumulativeInterfaceData?.[selectedInterfaceInstance]);
  };

  const showCopyToClipboardAction = (row: any) => {
    const hasValue = row?.value && row.value.length;
    const isSecret = row?.isSecret;
    const showPasswordEnabled =
      row.type === 'interface' ? showInterfacePassword : showAttributePassword;
    if (
      !hasValue ||
      (isSecret && (!hasPasswordViewPermission || !showPasswordEnabled))
    ) {
      return false;
    } else if (
      Array.isArray(row.value) &&
      areArrayKeysOfType(row.value, 'object')
    ) {
      return false;
    } else if (typeof row?.value === 'object' && !Array.isArray(row?.value)) {
      return false;
    }
    return true;
  };

  const showDollarReferenceAction = (row: any) => {
    if (Array.isArray(row.value) && areArrayKeysOfType(row.value, 'object')) {
      return false;
    } else if (
      typeof row?.value === 'object' &&
      row.value !== null &&
      !Array.isArray(row?.value)
    ) {
      return false;
    }
    return true;
  };

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
        title="Terraform Outputs"
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
              </div>
            ) : (
              ''
            )}
          </CardActions>
        }
      />
      {configExists ? (
        <CardContent>
          {loading || loadingResourceProperties ? (
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
            <div>
              {!Object.keys(interfaces)?.length &&
              !Object.keys(attributes)?.length ? (
                <>
                  <h3>Interfaces and Attributes</h3>
                  <p>Output values not found for this resource</p>
                </>
              ) : (
                ''
              )}

              {Object.keys(interfaces)?.length > 0 ? (
                <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      gap: 32,
                    }}
                  >
                    <h3>Interfaces</h3>
                    <Select
                      value={selectedInterfaceInstance}
                      onChange={(e: any) =>
                        handleInterfaceChange(e.target.value)
                      }
                      displayEmpty
                      style={{ width: '140px' }}
                    >
                      {interfaceInstances?.map((item: any) => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="20%">Key</TableCell>
                          <TableCell width="70%">Value</TableCell>
                          <TableCell width="10%">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {interfaceData?.map((row: any) => {
                          const { type, props }: { type: string; props: any } =
                            getComponentAndData(row.value, row.key);

                          const showCopyButton = showCopyToClipboardAction(row);
                          const showDollarRef = showDollarReferenceAction(row);
                          return (
                            <TableRow key={row.key}>
                              <TableCell>{row.key}</TableCell>
                              <TableCell>
                                {type === 'default' ? props.value : ''}
                                {type === 'router-link' ? (
                                  <RouterLink
                                    {...props}
                                    showReferenceVariable={
                                      showReferenceVariable
                                    }
                                  />
                                ) : (
                                  ''
                                )}
                              </TableCell>
                              <TableCell style={{ display: 'flex', gap: 6 }}>
                                {showDollarRef ? (
                                  <Tooltip title="Get Reference Value">
                                    <AttachMoney
                                      style={{
                                        cursor: 'pointer',
                                        fontSize: 18,
                                      }}
                                      onClick={() =>
                                        showReferenceVariable(
                                          row.key,
                                          'interface',
                                        )
                                      }
                                    />
                                  </Tooltip>
                                ) : (
                                  ''
                                )}
                                {showCopyButton ? (
                                  <Tooltip title="Copy Value">
                                    <ContentCopy
                                      style={{
                                        cursor: 'pointer',
                                        fontSize: 18,
                                      }}
                                    />
                                  </Tooltip>
                                ) : (
                                  ''
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ) : (
                ''
              )}
              {Object.keys(attributes)?.length > 0 ? (
                <Paper style={{ padding: '1rem' }}>
                  <h3>Attributes</h3>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="20%">Key</TableCell>
                          <TableCell width="70%">Value</TableCell>
                          <TableCell width="10%">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attributeData?.map((row: any) => {
                          // let component = this.getComponentAndData(cell, row?.key);
                          // return JSON.stringify(component);

                          const { type, props }: { type: string; props: any } =
                            getComponentAndData(row.value, row.key);
                          const showCopyButton = showCopyToClipboardAction(row);
                          const showDollarRef = showDollarReferenceAction(row);
                          return (
                            <TableRow key={row.key}>
                              <TableCell>{row.key}</TableCell>
                              <TableCell>
                                {/* <SmartTableMultiType value={props.value}/> */}
                                {type === 'default' ? props.value : ''}
                                {type === 'router-link' ? (
                                  <RouterLink
                                    {...props}
                                    showReferenceVariable={
                                      showReferenceVariable
                                    }
                                  />
                                ) : (
                                  ''
                                )}
                              </TableCell>
                              <TableCell style={{ display: 'flex', gap: 6 }}>
                                {showDollarRef ? (
                                  <Tooltip title="Get Reference Value">
                                    <AttachMoney
                                      style={{
                                        cursor: 'pointer',
                                        fontSize: 18,
                                      }}
                                      onClick={() =>
                                        showReferenceVariable(
                                          row.key,
                                          'attribute',
                                        )
                                      }
                                    />
                                  </Tooltip>
                                ) : (
                                  ''
                                )}
                                {showCopyButton ? (
                                  <Tooltip title="Copy Value">
                                    <ContentCopy
                                      style={{
                                        cursor: 'pointer',
                                        fontSize: 18,
                                      }}
                                      onClick={() =>
                                        copyToClipboard(attributes[row.key])
                                      }
                                    />
                                  </Tooltip>
                                ) : (
                                  ''
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ) : (
                ''
              )}
            </div>
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
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Reference Variable</DialogTitle>
        <DialogContent>
          <DialogContentText>{referenceVar}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={() => copyToClipboard(referenceVar || '')}>
            Copy
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={openNotification}
        onClose={handleCloseSnack}
        message="Value copied"
      />
    </Card>
  );
};
