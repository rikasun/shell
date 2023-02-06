## SSO Setup instructions

## Okta

If you have an Okta account with the [`API Access Management`](https://developer.okta.com/docs/concepts/api-access-management/) feature enabled, use the following steps to configure Cased Shell to use it.

1. Visit the Okta admin dashboard.
1. Visit (Applications -> Applications) to list the configured Applications.
1. Create a new `App Integration` for 'Cased Shell'.
    1. Select `OIDC - OpenID Connect` as the Sign-in method.
    1. Select `Web Application` as the Application Type.
    1. Select all token types under `Grant type` -> `Client acting on behalf of a user`.
    1. If you're configuring a Codespace deployment:
        1. Check the `Allow wildcard * in login URI redirect` box.
        1. Under `Sign-in redirect URIs` add:
            1. `https://*.preview.app.github.dev/idp/callback`
    1. Add the same value to `Sign-out redirect URIs`.
    1. Select `skip group assignment for now`.
    1. Click `Save` the application.
1. Copy the `Client ID` and `Client secret` from the application you just created.
    1. Use these values to configure Cased Shell's `OKTA_OIDC_CLIENT_ID` and `OKTA_OIDC_CLIENT_SECRET` [Codespace secret](https://github.com/cased/shell/settings/secrets/codespaces).
1. Follow Okta's instructions to [configure a group claim](https://developer.okta.com/docs/guides/customize-tokens-groups-claim/main/) for your application. 
1. Visit (`Security` -> `API`) to list the configured Authorization Servers.
1. Copy the value of the `Issuer URI` column from Authorization Server you'd like to use. The default one is fine it if works for your [groups setup](https://developer.okta.com/docs/guides/customize-tokens-groups-claim/main/).
    1. Use this value to configure Cased Shell's `OKTA_OIDC_ISSUER` [Codespace secret](https://github.com/cased/shell/settings/secrets/codespaces).
1. Rebuild your Codespaces container to pick up the new environment variables.

## Okta via SAML

Okta also provides SAML support. OIDC is preferred, but if you must use SAML, follow the steps below.

> Okta SAML apps do not accept wildcards in their callback URLs. You must create a new one for each Codespace.

1. Visit the Okta admin dashboard.
1. Visit (Applications -> Applications) to list the configured Applications.
1. Create a new `App Integration` for 'Cased Shell'.
    1. Select `SAML 2.0` as the Sign-in method.
    1. Give the integration a name.
    1. Select `Do not display application icon to users` as SAML does not support login via Okta.
    1. Add the following value to `Single sign on URL` and `Audience URI (SP Entity ID)`:
        1. `https://$CASED_SHELL_HOSTNAME/idp/callback`
    1. Add an `Attribute statement` for `username`:
        1. `Name` should be `username`.
        1. `Name format` should be `Basic`.
        1. `Value` should be `user.login`.
    1. Add an `Attribute statement` for `email`:
        1. `Name` should be `email`.
        1. `Name format` should be `Basic`.
        1. `Value` should be `user.email`.
    1. Add an `Attribute statement` for `groups`:
        1. `Name` should be `groups`.
        1. `Name format` should be `Basic`.
        1. `Filter` should be `Matches regex` `.*`.
    1. Click `Next`
    1. Select `I'm an Okta customer adding an internal app`.
    1. Click `Finish`.
    1. Click `View SAML Setup Instructions`.
    1. Copy the `Identity Provider Single Sign-On URL` and `Identity Provider Issuer` values.
        1. Use these values to configure Cased Shell's `OKTA_SAML_SSO_URL` and `OKTA_SAML_ISSUER` [Codespace secret](https://github.com/settings/codespaces) and grant `cased/shell` access to it.
    1. Click `Download certificate`.
        1. Base64 encode the certificate by running `base64 -i -w 0 <certificate.pem>` on linux or `base64 -i <certificate.pem>` on macOS.
        1. Use this value to configure Cased Shell's `OKTA_SAML_CA_CERT` [Codespace secret](https://github.com/settings/codespaces) and grant `cased/shell` access to it.
    1. Visit the `Assigmnents` tab on the created Application.
    1. Assign the application to the appropriate users or groups.
1. Rebuild your Codespaces container to pick up the new environment variables.

## GitHub

> GitHub OAuth Apps do not accept wildcards in their callback URLs. You must create a new one for each Codespace.

1. Create a new application at https://github.com/settings/applications/new or https://github.com/organizations/cased/settings/applications/new
    1. Set the `Homepage URL` to the URL of the Cased Shell Deployment.
    1. Set the `Authorization callback URL` to the URL of the Cased Shell Deployment with `/idp/callback` appended.
    1. Select the `Enable Device Flow` box.
1. Record the `Client ID`.
    1. Use this value to configure the `OAUTH_GITHUB_CLIENT_ID` [Codespace secret](https://github.com/settings/codespaces) and grant `cased/shell` access to it.
1. Generate a new `Client Secret`.
    1. Use this value to configure Cased Shell's `OAUTH_GITHUB_CLIENT_SECRET` [Codespace secret](https://github.com/settings/codespaces) and grant `cased/shell` access to it.
1. Rebuild your Codespaces container to pick up the new environment variables.

## Google

1. Create a [new OAuth client ID](https://console.cloud.google.com/apis/credentials/oauthclient)
2. Select the 'Web application' application type.
3. Name the application 'Cased Shell Codespaces'.
4. Add the following value to `Authorized redirect URIs`:
    1. `https://$CASED_SHELL_HOSTNAME/idp/callback`
1. Record the `Client ID`.
    1. Use this value to configure the `GOOGLE_OAUTH_CLIENT_ID` [Codespace secret](https://github.com/settings/codespaces) and grant `cased/shell` access to it.
1. Generate a new `Client Secret`.
    1. Use this value to configure Cased Shell's `GOOGLE_OAUTH_CLIENT_SECRET` [Codespace secret](https://github.com/settings/codespaces) and grant `cased/shell` access to it.
1. Rebuild your Codespaces container to pick up the new environment variables.