import uuid
import time
from datetime import datetime, timezone

# Shared file path
SHARED_FILE_PATH = "/shared-data/timestamp.txt"


def generate_random_string():
    return str(uuid.uuid4())


def main():
    while True:
        # Generate a new timestamp and random string
        timestamp = datetime.now(timezone.utc).isoformat()
        random_string = generate_random_string()
        content = f"{timestamp}: {random_string}"

        # Write to the shared file
        with open(SHARED_FILE_PATH, "w") as file:
            file.write(content)

        print(f"Writer: {content}", flush=True)
        time.sleep(5)


if __name__ == "__main__":
    main()
