function runSimulation() {
    // Clear previous results
    document.getElementById("inter-arrival-table").innerHTML = "";
    document.getElementById("simulation-table").innerHTML = "";
    document.getElementById("gantt-chart").innerHTML = "";
    document.getElementById("interpretation").innerHTML = "";

    // Get user input
    const distributionType = document.getElementById("distribution").value;
    const arrivalMean = parseFloat(document.getElementById("arrival-mean").value);
    const serviceDistributionType = document.getElementById("service-distribution").value;
    const serviceMean = parseFloat(document.getElementById("service-mean").value);
    const serviceVariance = parseFloat(document.getElementById("service-variance").value);
    const numServers = parseInt(document.getElementById("num-servers").value);
    const numObservations = parseInt(document.getElementById("num-observations").value);

    // Generate inter-arrival lookup table
    const interArrivalTable = generateInterArrivalTable(distributionType, arrivalMean);
    displayTable("inter-arrival-table", ["Cumulative Probability", "Inter-Arrival Time"], interArrivalTable);

    // Generate simulation table
    const simulationTable = simulateQueueingServer(
      interArrivalTable,
      serviceDistributionType,
      serviceMean,
      serviceVariance,
      numServers,
      numObservations
    );
    displayTable(
      "simulation-table",
      [
        "Random # for Arrival",
        "Inter-Arrival Time",
        "Arrival Time",
        "Random # for Service",
        "Service Time",
        "Start Time",
        "End Time",
        "Turnaround Time",
        "Waiting Time"
      ],
      simulationTable
    );

    // Calculate result metrics
    const avgInterArrivalTime = calculateAverage(interArrivalTable, "Inter-Arrival Time");
    const avgWaitingTime = calculateAverage(simulationTable, "Waiting Time");
    const avgTurnaroundTime = calculateAverage(simulationTable, "Turnaround Time");
    const systemLength = calculateSystemLength(simulationTable);
    const queueLength = calculateQueueLength(simulationTable);
    const serverUtilization = calculateServerUtilization(simulationTable, numServers);

    // Display result interpretation
    const interpretation = `Average Inter-Arrival Time: ${avgInterArrivalTime.toFixed(2)}<br>
                            Average Waiting Time: ${avgWaitingTime.toFixed(2)}<br>
                            Average Turnaround Time: ${avgTurnaroundTime.toFixed(2)}<br>
                            System Length: ${systemLength.toFixed(2)}<br>
                            Queue Length: ${queueLength.toFixed(2)}<br>
                            Server Utilization: ${serverUtilization.toFixed(2)}`;
    document.getElementById("interpretation").innerHTML = interpretation;

    // Generate Gantt chart
    generateGanttChart(simulationTable, numServers);
  }

  function generateInterArrivalTable(distributionType, arrivalMean) {
    // Generate inter-arrival lookup table based on distribution type and arrival mean
    let cumulativeProbability = 0;
    const interArrivalTable = [];

    for (let i = 1; i <= 10; i++) {
      const interArrivalTime = calculateInterArrivalTime(distributionType, arrivalMean, i / 10);
      cumulativeProbability += 0.1;
      interArrivalTable.push({
        cumulativeProbability,
        interArrivalTime
      });
    }

    return interArrivalTable;
  }

  function calculateInterArrivalTime(distributionType, mean, randomValue) {
    // Calculate inter-arrival time based on distribution type, mean, and random value
    // Implement the logic for different distribution types (Poisson, Exponential, Random, Normal, Uniform, Gamma)
    // Return the calculated inter-arrival time
    // Example implementation for exponential distribution:
    if (distributionType === "exponential") {
      return -mean * Math.log(randomValue);
    }
  }

  function simulateQueueingServer(
    interArrivalTable,
    serviceDistributionType,
    serviceMean,
    serviceVariance,
    numServers,
    numObservations
  ) {
    const simulationTable = [];
    let currentTime = 0;
    let nextArrivalTime = 0;
    let serviceEndTime = Array(numServers).fill(0);

    for (let i = 0; i < numObservations; i++) {
      const randomArrival = Math.random();
      const randomService = Math.random();

      // Find the inter-arrival time based on the random arrival value
      let interArrivalTime = 0;
      for (const row of interArrivalTable) {
        if (row.cumulativeProbability >= randomArrival) {
          interArrivalTime = row.interArrivalTime;
          break;
        }
      }

      // Calculate the arrival time and update the current time
      const arrivalTime = currentTime + interArrivalTime;
      currentTime = arrivalTime;

      // Find the server with the earliest service end time
      let nextServer = 0;
      let earliestServiceEndTime = serviceEndTime[0];
      for (let j = 1; j < numServers; j++) {
        if (serviceEndTime[j] < earliestServiceEndTime) {
          nextServer = j;
          earliestServiceEndTime = serviceEndTime[j];
        }
      }

      // Calculate the service time based on the random service value
      let serviceTime = 0;
      if (serviceDistributionType === "exponential") {
        serviceTime = -serviceMean * Math.log(randomService);
      }

      // Calculate the start and end times for the chosen server
      const startTime = Math.max(arrivalTime, serviceEndTime[nextServer]);
      const endTime = startTime + serviceTime;
      serviceEndTime[nextServer] = endTime;

      // Calculate the turnaround and waiting times
      const turnaroundTime = endTime - arrivalTime;
      const waitingTime = startTime - arrivalTime;

      // Add the observation to the simulation table
      simulationTable.push({
        randomArrival,
        interArrivalTime,
        arrivalTime,
        randomService,
        serviceTime,
        startTime,
        endTime,
        turnaroundTime,
        waitingTime
      });
    }

    return simulationTable;
  }

  function calculateAverage(data, property) {
    // Calculate the average of the specified property in the data array
    const sum = data.reduce((total, row) => total + row[property], 0);
    return sum / data.length;
  }

  function calculateSystemLength(simulationTable) {
    // Calculate the average system length
    const sum = simulationTable.reduce((total, row) => total + row.endTime - row.startTime, 0);
    const observationTime = simulationTable[simulationTable.length - 1].endTime;
    return sum / observationTime;
  }

  function calculateQueueLength(simulationTable) {
    // Calculate the average queue length
    const sum = simulationTable.reduce((total, row) => total + row.startTime - row.arrivalTime, 0);
    const observationTime = simulationTable[simulationTable.length - 1].endTime;
    return sum / observationTime;
  }

  function calculateServerUtilization(simulationTable, numServers) {
    // Calculate the server utilization
    const sum = simulationTable.reduce((total, row) => total + row.serviceTime, 0);
    const observationTime = simulationTable[simulationTable.length - 1].endTime;
    return (sum / observationTime) * numServers;
  }

  function displayTable(tableId, headers, data) {
    // Display the table with the provided headers and data
    const table = document.getElementById(tableId);

    // Create table headers
    const headerRow = document.createElement("tr");
    for (const header of headers) {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Create table rows
    for (const row of data) {
      const tr = document.createElement("tr");
      for (const key in row) {
        const td = document.createElement("td");
        td.textContent = row[key].toFixed(2);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }

  function generateGanttChart(simulationTable, numServers) {
    // Calculate the maximum end time in the simulation table
    const maxEndTime = Math.max(...simulationTable.map((row) => row.endTime));

    // Calculate the time slots for the Gantt chart
    const timeSlots = [];
    for (let i = 0; i <= maxEndTime; i++) {
      timeSlots.push(i);
    }

    // Create the Gantt chart HTML elements
    const ganttChart = document.getElementById("gantt-chart");
    const ganttBars = [];

    // Create Gantt bars for each server
    for (let server = 0; server < numServers; server++) {
      const ganttBar = document.createElement("div");
      ganttBar.classList.add("gantt-bar");
      ganttBar.style.width = "0";
      ganttBars.push(ganttBar);
      ganttChart.appendChild(ganttBar);
    }

    // Animate the Gantt bars based on the simulation table
    for (const row of simulationTable) {
      const server = Math.floor(Math.random() * numServers);
      const ganttBar = ganttBars[server];

      setTimeout(() => {
        const duration = row.endTime - row.startTime;
        ganttBar.style.width = `${duration * 10}px`;
      }, row.startTime * 1000);
    }
  }