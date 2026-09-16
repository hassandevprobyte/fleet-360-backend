const { exec } = require("child_process");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const deleteOlderFiles = (dir, dateTime, filesToKeep = 3) => {
  fs.readdir(dir, (error, files) => {
    if (error) {
      console.log("Error reading directory:", error);

      return;
    }

    const filesToDelete = files.slice(0, -filesToKeep);

    filesToDelete.forEach((file) => {
      const filePath = path.join(dir, file);

      fs.stat(filePath, (error, stats) => {
        if (error) {
          console.log(`Error reading file stats for ${file}:`, error);

          return;
        }

        if (stats.isFile() && stats.mtime.getTime() < dateTime) {
          fs.unlink(filePath, (error) => {
            if (error) {
              console.log(`Error deleting file ${file}:`, error);
            } else {
              console.log(`Deleted old file ${file}`);
            }
          });
        }
      });
    });
  });
};

const backupMongoDB = () => {
  cron.schedule("0 7 * * 0", (datetime) => {
    const DB_NAME = "fleet360";
    const BACKUP_DIR = path.join(__dirname, "../backup");

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const dateTime = new Date(datetime).getTime();
    const fileName = `backup_${dateTime}.gz`;

    const MONGODUMP_COMMAND = `mongodump --db ${DB_NAME} --gzip --archive=${path.join(BACKUP_DIR, fileName)}`;

    exec(MONGODUMP_COMMAND, (error, stdout, stderr) => {
      if (error) {
        console.log(error);

        return;
      }

      deleteOlderFiles(BACKUP_DIR, dateTime);

      console.log(`DB backed up successfully!`.bgGreen.white);
    });
  });
};

module.exports = backupMongoDB;
