import React, { useState } from 'react';
import { Content, InfoCard } from '@backstage/core-components';
import { Button, Grid, Box, TextField } from '@material-ui/core';
import { useSettings } from '../../state/useSettings';

export const SettingsPage = () => {
  const [username, setUsername] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [{ credentials, loading }, { saveUserCredentials }] = useSettings();

  const handleUsernameChange = (e: any) => {
    setUsername(e.target.value);
  };

  const handleAccessTokenChange = (e: any) => {
    setAccessToken(e.target.value);
  };

  const handleToggleAccessToken = () => {
    setShowAccessToken(prev => !prev);
  };

  const handleEditToggle = () => {
    setUsername(credentials?.facets_username || '');
    setAccessToken(credentials?.facets_accessToken || '');
    setShowAccessToken(true);
    setIsEditing(prev => !prev);
  };

  const handleSave = () => {
    saveUserCredentials({
      facets_username: username,
      facets_accessToken: accessToken,
    });
  };

  return (
    <Content noPadding>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <InfoCard
            title="Credentials"
            subheader="Facets.Cloud user credentials"
            actions={[
              <Button
                variant="outlined"
                color="primary"
                key="edit"
                onClick={handleEditToggle}
                disabled={loading}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>,
              <Button
                variant="outlined"
                color="primary"
                key="save"
                disabled={!isEditing || loading}
                onClick={handleSave}
              >
                Save
              </Button>,
            ]}
          >
            <Box>
              {isEditing ? (
                <>
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={handleUsernameChange}
                    margin="normal"
                    disabled={loading}
                  />

                  <TextField
                    label="Access Token"
                    variant="outlined"
                    type={showAccessToken ? 'text' : 'password'}
                    fullWidth
                    value={accessToken}
                    onChange={handleAccessTokenChange}
                    margin="normal"
                    disabled={loading}
                  />

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleToggleAccessToken}
                    style={{ marginTop: '1rem' }}
                    disabled={loading}
                  >
                    {showAccessToken
                      ? 'Hide Access Token'
                      : 'Show Access Token'}
                  </Button>
                </>
              ) : (
                <>
                  <p>
                    <strong>Username: </strong>
                    {credentials?.facets_username}
                  </p>
                  <p>
                    <strong>Access Token: </strong>
                    {showAccessToken
                      ? credentials?.facets_accessToken
                      : '********'}
                  </p>

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleToggleAccessToken}
                    disabled={loading}
                  >
                    {showAccessToken
                      ? 'Hide Access Token'
                      : 'Show Access Token'}
                  </Button>
                </>
              )}
            </Box>
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
