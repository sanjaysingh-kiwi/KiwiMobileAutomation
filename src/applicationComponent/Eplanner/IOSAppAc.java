package applicationComponent.Eplanner;

import java.util.HashMap;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

import com.session.DriverSession;

import action.Eplanner.IOSAppAction;
import applicationComponent.AppComponent;
import applicationComponent.ApplicationComponent;
import io.appium.java_client.MobileElement;
import io.appium.java_client.ios.IOSDriver;

@Test
public class IOSAppAc extends AppComponent implements ApplicationComponent {
	IOSDriver<MobileElement> driver = null;
	HashMap<String, String> testData = new HashMap<String, String>();
	IOSAppAction action = new IOSAppAction((IOSDriver<MobileElement>) DriverSession.getLastExecutionDriver());

	@SuppressWarnings("unchecked")
	@Override
	public void openApplication() throws Exception {
		driver = (IOSDriver<MobileElement>) DriverSession.getLastExecutionDriver();
		action.launchApp(driver);
	}

	@Override
	public void closeApplication() {
		action.closeApp();
	}

	@Override
	public void validateHomePage() {
		// TODO Auto-generated method stub

	}

	@SuppressWarnings("serial")
	public void addIndependentTask() {
		try {
			driver.findElement(By.xpath("//UIAApplication[1]/UIAWindow[1]/UIAButton[2]")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Add Task tapped successfully", "PASS",
					"Add Task button should be clicked");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Add Task button not tapped", "FAIL",
					"Add Task button should be tapped");
		}
		try {
			driver.findElement(By.xpath("//UIATableCell[@name='Courses']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Tapped on Courses field", "PASS",
					"Tapping on Courses field");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on Courses field",
					"FAIL", "Tapping on Courses field");
		}
		try {
			driver.findElement(By.xpath("//UIACollectionCell[@name='Math']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Type of Course selected successfully",
					"PASS", "Type of Course should be selected");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to select type of course",
					"FAIL", "Type of Course should be selected");
		}
		try {
			driver.findElement(By.xpath("//UIATextField[@value='Task Name']")).sendKeys("IndependentTask");
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Task Name entered successfully in text field", "PASS",
					"Task Name should be entered in text field");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Unable to type task name into text field", "FAIL", "Task Name should be entered in text field");
		}

		try {
			driver.findElement(By.xpath("//UIATableCell[@name='Due Date']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Due date tapped sucessfully", "PASS",
					"Tapping on Due date field");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on due date", "FAIL",
					"Tapping on Due date field");
		}

		try {
			driver.findElements(By.className("UIAPickerWheel")).get(0).sendKeys("July");
			driver.findElements(By.className("UIAPickerWheel")).get(1).sendKeys("13");
			driver.findElements(By.className("UIAPickerWheel")).get(2).sendKeys("2016");
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Due date selected sucessfully", "PASS",
					"Due Date should be selected inside the Date picker");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to select due date", "FAIL",
					"Due Date should be selected inside the Date picker");
		}

		try {
			driver.findElement(By.xpath("//UIATableCell[@name='Completion Date']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Completion date tapped sucessfully",
					"PASS", "Tapping on Completion date field");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on due date", "FAIL",
					"Tapping on Completion date field");
		}

		try {
			driver.findElements(By.className("UIAPickerWheel")).get(0).sendKeys("June");
			driver.findElements(By.className("UIAPickerWheel")).get(1).sendKeys("10");
			driver.findElements(By.className("UIAPickerWheel")).get(2).sendKeys("2016");
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Completion date selected sucessfully",
					"PASS", "Completion Date should be selected inside the Date picker");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to select completion date",
					"FAIL", "Completion Date should be selected inside the Date picker");
		}

		try {
			driver.findElement(By.xpath("//UIATableCell[@name='Estimated Time']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Estimated time tapped sucessfully",
					"PASS", "Tapping on Estimated time field");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on Estimated time",
					"FAIL", "Tapping on Estimated time field");
		}

		try {
//			JavascriptExecutor js = (JavascriptExecutor) driver;
//
//			js.executeScript("mobile: tap", new HashMap<String, Double>() {
//				{
//					put("tapCount", (double) 1);
//					put("touchCount", (double) 1);
//					put("duration", 0.5);
//					put("x", (double) 94);
//					put("y", (double) 491);
//				}
//			});
//
//			js.executeScript("mobile: tap", new HashMap<String, Double>() {
//				{
//					put("tapCount", (double) 1);
//					put("touchCount", (double) 1);
//					put("duration", 0.5);
//					put("x", (double) 180);
//					put("y", (double) 492);
//				}
//			});
			driver.findElement(By.xpath("//UIAPickerWheel[3]")).sendKeys("0.1");
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Estimated time selected sucessfully",
					"PASS", "Estimated time should be selected inside the Time picker");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to select Estimated time",
					"FAIL", "Estimated time should be selected inside the Time picker");
		}

		try {
			driver.findElement(By.xpath("//UIATableCell[@name='Repeat']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Repeat field tapped sucessfully",
					"PASS", "Tapping on Repeat field");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on Repeat field", "FAIL",
					"Tapping on Repeat field");
		}

		try {
			driver.findElement(By.xpath("//UIATableCell[@name='Weekdays']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Repeat task type field selected successfully", "PASS",
					"Repeat task type field should be selected");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to select Repeat Task Type",
					"FAIL", "Repeat task type field should be selected");
		}

		try {
			driver.findElement(By.xpath("//UIAButton[@name='Add Task']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Add Task button tapped successfully",
					"PASS", "Add Task button clicked successfully");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on Add Task button",
					"FAIL", "Add Task button clicked successfully");
		}

		try {
			driver.findElement(By.xpath("//UIATableCell[@name='Materials']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Materials field tapped sucessfully",
					"PASS", "Tapping on Materials field");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on Materials field",
					"FAIL", "Tapping on Materials field");
		}

		try {
			driver.findElement(By.xpath("//UIACollectionCell[@name='Device']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Material type field selected successfully", "PASS", "Material type field should be selected");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to select Material Type",
					"FAIL", "Material type field should be selected");
		}

		try {
			driver.findElement(By.xpath("//UIATableCell[@name='Notes']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Notes field tapped sucessfully",
					"PASS", "Tapping on Notes field");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on Notes field", "FAIL",
					"Tapping on Notes field");
		}

		try {
			driver.findElement(By.className("UIATextView")).sendKeys("Automation Testing Note");
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Task Note added successfully", "PASS",
					"Task Note should be added");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to add Task Note", "FAIL",
					"Task Note should be added");
		}

		try {
			driver.findElement(By.xpath("//UIAButton[@name='Done'][2]")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Done button on task note tapped successfully", "PASS",
					"Done button on task note should be tapped");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on Done button", "FAIL",
					"Done button on task note should be tapped");
		}

		try {
			driver.findElement(By.xpath("//UIAButton[@name='Done']")).click();
			DriverSession.getLastExecutionReportingInstance().teststepreporting(
					"Done button on new task tapped successfully", "PASS",
					"Done button on for new task should be tapped");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Unable to tap on Done button", "FAIL",
					"Done button on for new task should be tapped");
		}

		try {
			driver.switchTo().alert().accept();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Alert accepted", "PASS",
					"Accept alert");
		} catch (Exception e) {
			e.printStackTrace();
			DriverSession.getLastExecutionReportingInstance().teststepreporting("Failure while accepting alert", "FAIL",
					"Accept alert");
		}
	}
}
