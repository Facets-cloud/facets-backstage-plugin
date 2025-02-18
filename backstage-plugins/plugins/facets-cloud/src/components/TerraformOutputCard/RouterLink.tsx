import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Snackbar,
} from '@material-ui/core';
import React, { useState } from 'react';
import { ContentCopy, AttachMoney } from '@mui/icons-material';

type Props = {
  display: string;
  extraData: {
    name: string;
    populateData: any;
    popupType: string;
  };
  showReferenceVariable: (key: string, type: string) => void;
};

const RouterLink = ({ display, extraData, showReferenceVariable }: Props) => {
  const [open, setOpen] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
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

  return (
    <div>
      <Button variant="text" onClick={handleOpen}>
        {display}
      </Button>
      <Dialog
        open={open}
        maxWidth="lg"
        fullWidth
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{extraData.name}</DialogTitle>
        <DialogContent>
          {extraData.popupType === 'table' ? (
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
                  {Object.keys(extraData.populateData)?.map(key => {
                    return (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{extraData.populateData[key]}</TableCell>
                        <TableCell style={{ display: 'flex', gap: 6 }}>
                          <Tooltip title="Get Reference Value">
                            <AttachMoney
                              style={{
                                cursor: 'pointer',
                                fontSize: 18,
                              }}
                              onClick={() =>
                                showReferenceVariable(key, 'attribute')
                              }
                            />
                          </Tooltip>
                          <Tooltip title="Copy Value">
                            <ContentCopy
                              style={{
                                cursor: 'pointer',
                                fontSize: 18,
                              }}
                              onClick={() =>
                                copyToClipboard(extraData.populateData[key])
                              }
                            />
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            ''
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={openNotification}
        onClose={handleCloseSnack}
        message="Value copied"
      />
    </div>
  );
};

export default RouterLink;
