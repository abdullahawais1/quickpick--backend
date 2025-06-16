import mongoose from "mongoose";
import QueueEntry from "./models/queue"; // Adjust path as needed

const MONGO_URI = "mongodb+srv://dbUser:helloworld@cluster0.swuii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

interface QueueId {
  id: mongoose.Types.ObjectId;
  queueNumber: number;
}

async function cleanDuplicateQueueEntries() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const duplicates = await QueueEntry.aggregate([
      {
        $group: {
          _id: "$pickupPersonId",
          count: { $sum: 1 },
          ids: { $push: { id: "$_id", queueNumber: "$queueNumber" } },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const dup of duplicates) {
      // Sort entries by queueNumber ascending, so earliest stays
      const sortedIds = dup.ids.sort(
        (a: QueueId, b: QueueId) => a.queueNumber - b.queueNumber
      );

      // Keep the first one, delete the rest
      const idsToDelete = sortedIds.slice(1).map((d: QueueId) => d.id);

      if (idsToDelete.length > 0) {
        const result = await QueueEntry.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`Deleted ${result.deletedCount} duplicate entries for pickupPersonId ${dup._id}`);
      }
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error cleaning duplicates:", err);
    await mongoose.disconnect();
  }
}

cleanDuplicateQueueEntries();
