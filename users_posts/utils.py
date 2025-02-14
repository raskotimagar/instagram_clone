from datetime import datetime, timezone, timedelta

def get_relative_time(timestamp):
    now = datetime.now(timezone.utc)
    diff = now - timestamp

    if diff < timedelta(seconds=60):
        return f"{int(diff.total_seconds())} s"
    elif diff < timedelta(minutes=60):
        return f"{int(diff.total_seconds() // 60)} m"
    elif diff < timedelta(hours=24):
        return f"{int(diff.total_seconds() // 3600)} h"
    elif diff < timedelta(weeks=1):
        return f"{int(diff.total_seconds() // 86400)} d"
    elif diff < timedelta(weeks=4):
        return f"{int(diff.total_seconds() // (7 * 86400))} w"
    elif timestamp.year == now.year:
        return timestamp.strftime("%b %d")  
    else:
        return timestamp.strftime("%b %d %Y")   
