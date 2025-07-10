## V2ray config tester
Test v2ray URIs connectivity and expose the good ones in a local subscription

## How to use
The app exposes a route `/add-config` which accepts a post request with the following body schema:
```
{
  config: string;
}
```
Then the config is tested, and if it passess the connectivity check, it will be avaialbe via `/s/configs` which acts as a subscription link and always shows the last 60 configs which have passed the connectivity check

tldr; - Send your configs to `/add-config` and put `/s/configs` as a subscription link in your client

## How to run
Clone the reposity and install the dependencies:
```bash
pnpm install
```
Then download the latest [v2-uri-parser](https://github.com/Keivan-sf/v2-uri-parser) inside the root directory of the project and make it executable:
```bash
wget https://github.com/Keivan-sf/v2-uri-parser/releases/download/v0.1.1/v2parser && chmod +x v2-uri-parser
```

You can now run the application which by default runs on port `5574`:
```bash
pnpm start
```

## Configuration
All env variables are optional for now, you may change them as you wish:
```env
# [OPTIONAL, DEFAULT=5574] used for both subscription server and tester
PORT=5574

# [OPTIONAL] remote end point for sending configs, should accept the same schema as local server
REMOTE_END_POINT=https://example.example/s/add-config

# [OPTIONAL, DEFAULT=5] number of concurrent tests. 5 is recommended
CONCURRENT_TESTS=5

# Port range for testers. Recommended to contain greater number of ports than CONCURRENT_TESTS. But if not, it's ok; since they will be managed in a pool

# [OPTIONAL, DEFAULT=4010] 
PORT_RANGE_START=4010

# [OPTIONAL, DEFAULT=4020] 
PORT_RANGE_END=4020
```
