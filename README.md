Micro Service for Payer Info / hds_payer table

# To test locally:
  sls invoke local -f payerConfigVersionLambda -p ./tests/test_ddb_stream_event.json

# To deploy:
  sls deploy -v
