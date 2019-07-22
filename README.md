Micro Service for DynamoDB table and its backup based on Streams

# To test locally:
  sls invoke local -f payerConfigVersionLambda -p ./tests/test_ddb_stream_event.json

# To deploy:
  sls deploy -v
