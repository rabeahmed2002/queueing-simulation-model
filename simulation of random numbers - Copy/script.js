document.getElementById('queueForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form submission

  // Clear previous results
  clearResults();

  // Get input values
  const distributionType = document.getElementById('distributionType').value;
  const arrivalMean = parseFloat(document.getElementById('arrivalMean').value);
  const serviceDistributionType = document.getElementById('serviceDistributionType').value;
  const serviceMean = parseFloat(document.getElementById('serviceMean').value);
  const serviceVariance = parseFloat(document.getElementById('serviceVariance').value);
  const numServers = parseInt(document.getElementById('numServers').value);
  const numObservations = parseInt(document.getElementById('numObservations').value);

  // Generate inter-arrival lookup table
  const interArrivalLookupTable = generateInterArrivalLookupTable(distributionType, arrivalMean, numObservations);

  // Display inter-arrival lookup table
  displayLookupTable(interArrivalLookupTable);

  // Simulate the queueing system
  const simulationResults = simulateQueueingSystem(interArrivalLookupTable, serviceDistributionType, serviceMean, serviceVariance, numServers, numObservations);

  // Display simulation results
  displaySimulationResults(simulationResults);

  // Generate Gantt chart
  generateGanttChart(simulationResults, numServers);

  // Calculate result interpretation
  const interpretation = calculateResultInterpretation(simulationResults);

  // Display result interpretation
  displayResultInterpretation(interpretation);
});

function clearResults() {
  document.getElementById('lookupTable').getElementsByTagName('tbody')[0].innerHTML = '';
  document.getElementById('simulationTable').getElementsByTagName('tbody')[0].innerHTML = '';
  document.getElementById('ganttChart').innerHTML = '';
  document.getElementById('interpretation').textContent = '';
}

function generateInterArrivalLookupTable(distributionType, mean, numObservations) {
  const lookupTable = [];
  let cumulativeProbability = 0;

  for (let i = 0; i < numObservations; i++) {
    const interArrivalTime = calculateInterArrivalTime(distributionType, mean);
    cumulativeProbability += 1 / numObservations;
    lookupTable.push({
      cumulativeProbabilityLookup: cumulativeProbability.toFixed(2),
      cumulativeProbability: cumulativeProbability.toFixed(2),
      interArrivalTime: interArrivalTime.toFixed(2)
    });
  }

  return lookupTable;
}

function calculateInterArrivalTime(distributionType, mean) {
  let interArrivalTime;

  switch (distributionType) {
    case 'poisson':
      interArrivalTime = Math.log(1 - Math.random()) / (-mean);
      break;
    case 'exponential':
      interArrivalTime = -mean * Math.log(1 - Math.random());
      break;
    case 'random':
      interArrivalTime = Math.random() * mean;
      break;
    case 'normal':
      interArrivalTime = mean + (Math.random() * mean);
      break;
    case 'uniform':
      interArrivalTime = Math.random() * (2 * mean) - mean;
      break;
    case 'gamma':
      interArrivalTime = Math.random() * mean;
      break;
    default:
      interArrivalTime = 0;
  }

  return interArrivalTime;
}

function displayLookupTable(interArrivalLookupTable) {
  const tbody = document.getElementById('lookupTable').getElementsByTagName('tbody')[0];

  interArrivalLookupTable.forEach(function(row) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.cumulativeProbabilityLookup}</td>
                    <td>${row.cumulativeProbability}</td>
                    <td>${row.interArrivalTime}</td>`;
    tbody.appendChild(tr);
  });
}

function simulateQueueingSystem(interArrivalLookupTable, serviceDistributionType, serviceMean, serviceVariance, numServers, numObservations) {
  const simulationResults = [];

  for (let i = 0; i < numObservations; i++) {
    const arrival = generateRandomNumber();
    const interArrivalTime = lookupInterArrivalTime(interArrivalLookupTable, arrival);
    const arrivalTime = calculateArrivalTime(simulationResults, interArrivalTime);
    const service = generateRandomNumber();
    const serviceTime = calculateServiceTime(serviceDistributionType, serviceMean, serviceVariance);
    const startTime = calculateStartTime(simulationResults, arrivalTime);
    const endTime = startTime + serviceTime;
    const turnAroundTime = endTime - arrivalTime;
    const waitingTime = turnAroundTime - serviceTime;

    simulationResults.push({
      arrival,
      interArrivalTime,
      arrivalTime,
      service,
      serviceTime,
      startTime,
      endTime,
      turnAroundTime,
      waitingTime
    });
  }

  return simulationResults;
}

function generateRandomNumber() {
  return Math.random();
}

function lookupInterArrivalTime(interArrivalLookupTable, arrival) {
  let interArrivalTime = 0;

  for (let i = 0; i < interArrivalLookupTable.length; i++) {
    if (arrival <= parseFloat(interArrivalLookupTable[i].cumulativeProbability)) {
      interArrivalTime = parseFloat(interArrivalLookupTable[i].interArrivalTime);
      break;
    }
  }

  return interArrivalTime;
}

function calculateArrivalTime(simulationResults, interArrivalTime) {
  const lastEndTime = simulationResults.length > 0 ? simulationResults[simulationResults.length - 1].endTime : 0;
  return lastEndTime + interArrivalTime;
}

function calculateServiceTime(distributionType, mean, variance) {
  let serviceTime;

  switch (distributionType) {
    case 'poisson':
      serviceTime = Math.log(1 - Math.random()) / (-mean);
      break;
    case 'exponential':
      serviceTime = -mean * Math.log(1 - Math.random());
      break;
    case 'random':
      serviceTime = Math.random() * mean;
      break;
    case 'normal':
      serviceTime = Math.sqrt(variance) * (Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())) + mean;
      break;
    case 'uniform':
      serviceTime = Math.random() * (2 * mean) - mean;
      break;
    case 'gamma':
      serviceTime = Math.random() * mean;
      break;
    default:
      serviceTime = 0;
  }

  return serviceTime;
}

function calculateStartTime(simulationResults, arrivalTime) {
  let startTime = arrivalTime;

  simulationResults.forEach(function(result) {
    if (result.endTime > startTime) {
      startTime = result.endTime;
    }
  });

  return startTime;
}

function displaySimulationResults(simulationResults) {
  const tbody = document.getElementById('simulationTable').getElementsByTagName('tbody')[0];

  simulationResults.forEach(function(result) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${result.arrival.toFixed(2)}</td>
                    <td>${result.interArrivalTime.toFixed(2)}</td>
                    <td>${result.arrivalTime.toFixed(2)}</td>
                    <td>${result.service.toFixed(2)}</td>
                    <td>${result.serviceTime.toFixed(2)}</td>
                    <td>${result.startTime.toFixed(2)}</td>
                    <td>${result.endTime.toFixed(2)}</td>
                    <td>${result.turnAroundTime.toFixed(2)}</td>
                    <td>${result.waitingTime.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
}

function generateGanttChart(simulationResults, numServers) {
  const ganttChart = document.getElementById('ganttChart');
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const chartData = [];

  simulationResults.forEach(function(result, index) {
    const serverIndex = index % numServers;
    chartData.push({
      label: `Job ${index + 1}`,
      color: colors[serverIndex],
      start: result.startTime,
      end: result.endTime
    });
  });

  const chartOptions = {
    title: 'Gantt Chart',
    bars: 'horizontal',
    stack: true
  };

  const chart = new dhtmlXChart({
    view: 'gantt',
    container: ganttChart,
    tasks: {
      data: chartData
    },
    scale: {
      step: 1
    }
  });

  chart.render();
}

function calculateResultInterpretation(simulationResults) {
  let totalInterArrivalTime = 0;
  let totalWaitingTime = 0;
  let totalTurnAroundTime = 0;
  let maxLengthSystem = 0;
  let maxLengthQueue = 0;
  let totalServerUtilization = 0;

  simulationResults.forEach(function(result) {
    totalInterArrivalTime += result.interArrivalTime;
    totalWaitingTime += result.waitingTime;
    totalTurnAroundTime += result.turnAroundTime;
    maxLengthSystem = Math.max(maxLengthSystem, result.endTime);
    maxLengthQueue = Math.max(maxLengthQueue, result.startTime - result.arrivalTime);
    totalServerUtilization += result.serviceTime;
  });

  const numObservations = simulationResults.length;
  const avgInterArrivalTime = totalInterArrivalTime / numObservations;
  const avgWaitingTime = totalWaitingTime / numObservations;
  const avgTurnAroundTime = totalTurnAroundTime / numObservations;
  const avgLengthSystem = maxLengthSystem / numObservations;
  const avgLengthQueue = maxLengthQueue / numObservations;
  const serverUtilization = totalServerUtilization / maxLengthSystem;

  return {
    avgInterArrivalTime: avgInterArrivalTime.toFixed(2),
    avgWaitingTime: avgWaitingTime.toFixed(2),
    avgTurnAroundTime: avgTurnAroundTime.toFixed(2),
    avgLengthSystem: avgLengthSystem.toFixed(2),
    avgLengthQueue: avgLengthQueue.toFixed(2),
    serverUtilization: serverUtilization.toFixed(2)
  };
}

function displayResultInterpretation(interpretation) {
  const interpretationText = `Average Inter-Arrival Time: ${interpretation.avgInterArrivalTime}<br>
                              Average Waiting Time: ${interpretation.avgWaitingTime}<br>
                              Average Turnaround Time: ${interpretation.avgTurnAroundTime}<br>
                              Average Length of System: ${interpretation.avgLengthSystem}<br>
                              Average Length of Queue: ${interpretation.avgLengthQueue}<br>
                              Server Utilization: ${interpretation.serverUtilization}`;

  document.getElementById('interpretation').innerHTML = interpretationText;
}
