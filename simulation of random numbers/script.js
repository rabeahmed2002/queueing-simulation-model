function calculate() {
    // Get input values
    const distribution = document.getElementById("distribution").value;
    const meanArrival = parseFloat(document.getElementById("meanArrival").value);
    const serviceDistribution = document.getElementById("serviceDistribution").value;
    const meanService = parseFloat(document.getElementById("meanService").value);
    const varianceService = parseFloat(document.getElementById("varianceService").value);
    const numServers = parseInt(document.getElementById("numServers").value);
    const numObservations = parseInt(document.getElementById("numObservations").value);
  
    // Perform calculations
    const interArrivalLookupTable = generateLookupTable(distribution, meanArrival, numObservations);
    const simulationTable = simulateQueueingServer(
      interArrivalLookupTable,
      serviceDistribution,
      meanService,
      varianceService,
      numServers
    );
    const ganttChart = generateGanttChart(simulationTable, numServers);
    const resultInterpretation = interpretResults(simulationTable);
  
    // Display results
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
      <h3>Results:</h3>
      <h4>Inter Arrival Lookup Table:</h4>
      <table>
        <tr>
          <th>Cumulative Probability</th>
          <th>Inter Arrival Time</th>
        </tr>
        ${interArrivalLookupTable
          .map(
            (entry) => `
            <tr>
              <td>${entry.cumulativeProbability.toFixed(2)}</td>
              <td>${entry.interArrivalTime.toFixed(2)}</td>
            </tr>
          `
          )
          .join("")}
      </table>
      <h4>Simulation Table:</h4>
      <table>
        <tr>
        <th>Sequence number</th>
          <th>Cumulative Probability</th>
          <th>Inter Arrival Time</th>
          <th>Arrival Time</th>
          <th>Service Time</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Turn Around Time</th>
          <th>Waiting Time</th>
        </tr>
        ${simulationTable
          .map(
            (entry) =>
             `
            <tr>
              <td>${entry.sequence}</td>
              <td>${entry.randomSequence.toFixed(5)}</td>
              <td>${entry.interArrivalTime.toFixed(0)}</td>
              <td>${entry.arrivalTime.toFixed(0)}</td>
              <td>${entry.serviceTime.toFixed(0)}</td>
              <td>${entry.startTime.toFixed(0)}</td>
              <td>${entry.endTime.toFixed(0)}</td>
              <td>${entry.turnAroundTime.toFixed(0)}</td>
              <td>${entry.waitingTime.toFixed(0)}</td>
            </tr>
          `
          //    `
          //   <tr>
          //     <td>${entry.sequence}</td>
          //     <td>${entry.randomSequence.toFixed(4)}</td>
          //     <td>${entry.interArrivalTime.toFixed(2)}</td>
          //     <td>${entry.arrivalTime.toFixed(2)}</td>
          //     <td>${entry.serviceTime.toFixed(2)}</td>
          //     <td>${entry.startTime.toFixed(2)}</td>
          //     <td>${entry.endTime.toFixed(2)}</td>
          //     <td>${entry.turnAroundTime.toFixed(2)}</td>
          //     <td>${entry.waitingTime.toFixed(2)}</td>
          //   </tr>
          // `
          )
          .join("")}
      </table>
      <h4>Gantt Chart:</h4>
      <pre>${ganttChart}</pre>
      <h4>Result Interpretation:</h4>
      <pre>${resultInterpretation}</pre>
    `;
  }

  
  function generateLookupTable(distribution, meanArrival, numObservations) {
    const lookupTable = [];
    let cumulativeProbability = 0;
  
    for (let i = 0; i < numObservations; i++) {
      let interArrivalTime;
      switch (distribution) {
        case "poisson":
          interArrivalTime = generatePoissonRandom(meanArrival);
          break;
        case "exponential":
          interArrivalTime = generateExponentialRandom(meanArrival);
          break;
        case "random":
          interArrivalTime = generateRandom();
          break;
        case "normal":
          interArrivalTime = generateNormalRandom(meanArrival);
          break;
        case "uniform":
          interArrivalTime = generateUniformRandom(meanArrival);
          break;
        case "gamma":
          interArrivalTime = generateGammaRandom(meanArrival);
          break;
        default:
          interArrivalTime = 0;
      }
  
      cumulativeProbability += 1 / numObservations;
      lookupTable.push({
        cumulativeProbability,
        interArrivalTime,
      });
    }
  
    return lookupTable;
  }
  
  function generatePoissonRandom(meanArrival) {
    return Math.round(10*(-Math.log(Math.random()) / meanArrival));
  }
  
  function generateExponentialRandom(meanArrival) {
    return Math.round(10*(-meanArrival * Math.log(Math.random())));
  }
  
  function generateRandom() {
    return Math.random();
  }
  
  function generateNormalRandom(meanArrival) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += Math.random();
    }
    return Math.round(10*(meanArrival + (sum - 6)));
  }
  
  function generateUniformRandom(meanArrival) {
    return Math.round(10*(Math.random() * meanArrival * 2));
  }
  
  function generateGammaRandom(meanArrival) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += Math.random();
    }
    return Math.round(10*(meanArrival * sum));
  }
  
  function simulateQueueingServer(
    interArrivalLookupTable,
    serviceDistribution,
    meanService,
    varianceService,
    numServers
  ) {
    const simulationTable = [];
    let currentTime = 0;
    let sequence = 0;
    const queue = [];
  
    while (simulationTable.length < interArrivalLookupTable.length) {
      const interArrivalLookup = interArrivalLookupTable[simulationTable.length];
      const randomSequence = generateRandom();
      const serviceTime = generateServiceTime(serviceDistribution, meanService, varianceService);
  
      const arrivalTime = currentTime + interArrivalLookup.interArrivalTime;
      const startTime = Math.max(arrivalTime, getServerEndTime());
      const endTime = startTime + serviceTime;
      const turnAroundTime = endTime - arrivalTime;
      const waitingTime = startTime - arrivalTime;
  
      simulationTable.push({
        randomSequence,
        interArrivalTime: interArrivalLookup.interArrivalTime,
        arrivalTime,
        sequence,
        serviceTime,
        startTime,
        endTime,
        turnAroundTime,
        waitingTime,
      });
  
      if (queue.length < numServers) {
        queue.push(simulationTable[simulationTable.length - 1]);
      } else {
        queue.sort((a, b) => a.endTime - b.endTime);
        const nextServer = queue.shift();
        queue.push(simulationTable[simulationTable.length - 1]);
        currentTime = nextServer.endTime;
      }
  
      sequence++;
    }
  
    return simulationTable;
  
    function getServerEndTime() {
      let maxEndTime = 0;
      for (const item of queue) {
        if (item.endTime > maxEndTime) {
          maxEndTime = item.endTime;
        }
      }
      return maxEndTime;
    }
  
    function generateServiceTime(serviceDistribution, meanService, varianceService) {
      let serviceTime;
      switch (serviceDistribution) {
        case "poisson":
          serviceTime = generatePoissonRandom(meanService);
          break;
        case "exponential":
          serviceTime = generateExponentialRandom(meanService);
          break;
        case "random":
          serviceTime = generateRandom();
          break;
        case "normal":
          serviceTime = generateNormalRandom(meanService);
          break;
        case "uniform":
          serviceTime = generateUniformRandom(meanService);
          break;
        case "gamma":
          serviceTime = generateGammaRandom(meanService);
          break;
        default:
          serviceTime = 0;
      }
      return Math.max(serviceTime, 0.01); // Ensure minimum service time of 0.01 to avoid division by zero
    }
  }
  
  function generateGanttChart(simulationTable, numServers) {
    const serverGanttCharts = [];
    for (let i = 0; i < numServers; i++) {
      serverGanttCharts.push([]);
    }
  
    for (const item of simulationTable) {
      const serverIndex = item.sequence % numServers;
      serverGanttCharts[serverIndex].push({
        startTime: item.startTime,
        endTime: item.endTime,
      });
    }
  
    let ganttChart = "";
    for (let i = 0; i < numServers; i++) {
      ganttChart += `Server ${i}: `;
      for (const item of serverGanttCharts[i]) {
        ganttChart += `[${item.startTime.toFixed(2)}, ${item.endTime.toFixed(2)}] `;
      }
      ganttChart += "\n";
    }

    const ganttChartHtml = `
  <div class="gantt-chart">
    ${serverGanttCharts
      .map(
        (serverGanttChart) => `
        <div class="gantt-chart-row">
          <div class="gantt-chart-bar" style="width: ${serverGanttChart.width}%"></div>
          <div class="gantt-chart-label">Server ${serverGanttChart.serverIndex}</div>
          <div class="gantt-chart-time">${serverGanttChart.timeRange}</div>
        </div>
      `
      )
      .join("")}
  </div>
`;

  
    return ganttChart;
  }




  
  function interpretResults(simulationTable) {
    const totalObservations = simulationTable.length;
    let totalInterArrivalTime = 0;
    let totalTurnAroundTime = 0;
    let totalWaitingTime = 0;
    let totalSystemLength = 0;
    let totalQueueLength = 0;
    let totalUtilization = 0;
  
    for (const item of simulationTable) {
      totalInterArrivalTime += item.interArrivalTime;
      totalTurnAroundTime += item.turnAroundTime;
      totalWaitingTime += item.waitingTime;
      totalSystemLength += item.startTime - item.arrivalTime;
      totalQueueLength += item.startTime - item.arrivalTime - item.serviceTime;
      totalUtilization += item.serviceTime;
    }
  
    const avgInterArrivalTime =totalInterArrivalTime / totalObservations;
    const avgTurnAroundTime = totalTurnAroundTime / totalObservations;
    const avgWaitingTime = totalWaitingTime / totalObservations;
    const avgSystemLength = totalSystemLength / totalObservations;
    const avgQueueLength = totalQueueLength / totalObservations;
    const serverUtilization = totalUtilization / simulationTable[simulationTable.length - 1].endTime;  

    return `
      Average Inter Arrival Time: ${avgInterArrivalTime.toFixed(3)}
      Average Turn Around Time: ${avgTurnAroundTime.toFixed(3)}
      Average Waiting Time: ${avgWaitingTime.toFixed(3)}
      Average System Length: ${avgSystemLength.toFixed(3)}
      Average Queue Length: ${-1*  avgQueueLength.toFixed(3)}
      Server Utilization: ${(serverUtilization * 100).toFixed(3)}%
    `;
  }
  