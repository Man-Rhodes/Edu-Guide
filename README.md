<!-- coderabbit-ai-generated:v1 -->

# EduGuide Gauteng

Run the website with Node.js 18 or later:

```sh
node server.js
```

Open http://localhost:3000. Set `PORT` to change the port. Accounts and the last five questions asked while signed in are stored in `data/accounts.json`; `EDUGUIDE_DATA_FILE` can select another persistent file. Keep this file private and back it up if profiles need to survive redeployment. Sessions expire after 24 hours or when the server restarts. Questions asked while signed out are not added to a profile, and clearing the chat does not delete profile activity.

This simple server is intended for a single instance. Public deployment needs HTTPS, durable private storage, and production protections such as login rate limiting and account recovery.
