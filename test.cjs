const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWEzZDI5ZjNiNzU4YmFlN2E4NDY2ZjEiLCJyb2xlIjoiUE9MSUNFIiwiaWF0IjoxNzg5MjM3NDE1LCJleHAiOjE3ODkzMjM4MTV9.J6Xt8VkrbncliGgztf5b_9RWGIYR8RkA7jgv339JM3A";
fetch("http://localhost:5001/api/case/stats", { headers: { Authorization: "Bearer " + token } })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
