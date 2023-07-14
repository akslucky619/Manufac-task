interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
  /**
   * Moves the employee with employeeID (uniqueId) under a supervisor
   * (another employee) that has supervisorID (uniqueId).
   * E.g. Move Bob(employeeID) to be subordinate of
   * Georgina (supervisorID).
   * @param employeeID
   * @param supervisorID
   */
  move(employeeID: number, supervisorID: number): void;
  /** Undo last move action */
  undo(): void;
  /** Redo last undone action */
  redo(): void;
}

class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;
  private history: {
    employeeID: number;
    oldSupervisorID: number;
    newSupervisorID: number;
  }[] = [];
  private historyIndex: number = -1;

  constructor(ceo: Employee) {
    this.ceo = ceo;
  }

  private findEmployee(
    employeeID: number,
    employee: Employee
  ): Employee | null {
    if (employee.uniqueId === employeeID) {
      return employee;
    }
    for (let subordinate of employee.subordinates) {
      let result = this.findEmployee(employeeID, subordinate);
      if (result) {
        return result;
      }
    }
    return null;
  }

  private findSupervisor(
    employeeID: number,
    employee: Employee
  ): Employee | null {
    for (let subordinate of employee.subordinates) {
      if (subordinate.uniqueId === employeeID) {
        return employee;
      }
      let result = this.findSupervisor(employeeID, subordinate);
      if (result) {
        return result;
      }
    }
    return null;
  }

  move(employeeID: number, supervisorID: number): void {
    let employee = this.findEmployee(employeeID, this.ceo);
    let oldSupervisor = this.findSupervisor(employeeID, this.ceo);
    let newSupervisor = this.findEmployee(supervisorID, this.ceo);

    if (employee && oldSupervisor && newSupervisor) {
      oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
        (e) => e.uniqueId !== employeeID
      );
      newSupervisor.subordinates.push(employee);

      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push({
        employeeID,
        oldSupervisorID: oldSupervisor.uniqueId,
        newSupervisorID: supervisorID,
      });
      this.historyIndex++;
    }
  }

  undo(): void {
    if (this.historyIndex < 0) {
      return;
    }
    let action = this.history[this.historyIndex];
    this.move(action.employeeID, action.oldSupervisorID);
    this.historyIndex--;
  }

  redo(): void {
    if (this.historyIndex >= this.history.length - 1) {
      return;
    }
    this.historyIndex++;
    let action = this.history[this.historyIndex];
    this.move(action.employeeID, action.newSupervisorID);
  }
}
