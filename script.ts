const main = async () => {
  return "Fortune"
}

const realMain = () => {
  return new Promise((res, rej) => {
    res("Fortune")
    // rej("Error")
  })
}

realMain()
  .then(res => console.log("Got a result:", res))
  .catch(err => console.log("Caught an err:", err))
