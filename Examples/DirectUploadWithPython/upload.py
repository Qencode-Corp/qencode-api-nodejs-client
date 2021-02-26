import sys
from qencode import QencodeClientException, QencodeTaskException, tus_uploader

path = sys.argv[1]
upload_url = sys.argv[2]
chunk_size = sys.argv[3]

uploadedFile = tus_uploader.upload(file_path=path, url=upload_url, log_func=None, chunk_size=chunk_size)
print uploadedFile.url