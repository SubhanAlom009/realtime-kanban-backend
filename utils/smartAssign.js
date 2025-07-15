// utils/smartAssign.js
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";

export const findLeastLoadedUser = async () => {
  const users = await User.find();
  if (!users.length) return null;

  const taskCounts = await Task.aggregate([
    { $match: { assignedTo: { $ne: null } } },
    { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  taskCounts.forEach(({ _id, count }) => {
    countMap[_id.toString()] = count;
  });

  let leastLoaded = users[0];
  let minCount = countMap[leastLoaded._id.toString()] || 0;

  for (const user of users) {
    const userId = user._id.toString();
    const userCount = countMap[userId] || 0;
    if (userCount < minCount) {
      leastLoaded = user;
      minCount = userCount;
    }
  }

  return leastLoaded;
};
