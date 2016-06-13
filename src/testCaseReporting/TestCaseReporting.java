package testCaseReporting;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;

import org.openqa.selenium.WebDriver;

import com.session.DriverSession;
import com.utilities.GlobalParam;

public class TestCaseReporting extends Reporting {

	public OutputStream htmlfile;
	public PrintStream printhtml;
	public FileInputStream fis = null;
	public BufferedReader reader = null;
	private int PassCount = 0;
	private int FailCount = 0;
	private int infoCount = 0;
	public long startTime = 0;
	public long lastTime = 0;
	public String testCaseName = "";
	WebDriver lastExecutionDriver = null;

	public TestCaseReporting(String testCaseName) {
		setTestCaseName(testCaseName);

	}

	public void setTestCaseName(String tcName) {
		this.testCaseName = tcName;
	}

	public void Openfile() {
		try {

			// htmlfile = new FileOutputStream(SuiteReporting.pathToSuiteFolder+
			// "/TestCase/" +
			// testCaseName+" ("+GlobalParam.CURRENT_EXECUTION_MODE+")"+".html",
			// true);
			// System.out.println(SuiteReporting.pathToSuiteFolder+ "/TestCase/"
			// +
			// testCaseName+"
			// ("+GlobalParam.CURRENT_EXECUTION_MODE+")"+".html");

			htmlfile = new FileOutputStream(
					SuiteReporting.pathToSuiteFolder + "/TestCase/" + testCaseName + " ("
							+ GlobalParam.CURRENT_EXECUTION_MODE + ")_" + DriverSession.getBrowserName() + ".html",
					true);
			printhtml = new PrintStream(htmlfile);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public void addStepReport(String actual, String expected, boolean status) {
		String stat = null;
		if (status)
			stat = "PASS";
		else
			stat = "FAIL";
		teststepreporting(actual, stat, expected);
	}

	public void teststepreporting(String strActualResult, String strPassFail, String sExpectedMessage) { // ##U
		try {
			if (!GlobalParam.Reporting)
				return;

			String nameOfScreenShot = "";
			String imgLink = "";
			Openfile();

			int TeststepCount = PassCount + FailCount + infoCount + 1;

			printhtml.append("<tr>");

			printhtml
					.append("<td width='10%' bgcolor='#FFFFDC' valign='middle' align='center' ><font color='#000000' face='Tahoma' size='2'>"
							+ TeststepCount + "</font></td>");
			printhtml
					.append("<td width='22%' bgcolor='#FFFFDC' valign='top' align='justify' ><font color='#000000' face='Tahoma' size='2'>"
							+ sExpectedMessage + "</font></td>");
			printhtml
					.append("<td width='22%' bgcolor='#FFFFDC' valign='top' align='justify' ><font color='#000000' face='Tahoma' size='2'>"
							+ strActualResult + "</font></td>");
			if (strPassFail.toUpperCase() == "PASS") {
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
								+ strPassFail.toUpperCase

								() + "</font></b></td>");
				PassCount = PassCount + 1;
			} else if (strPassFail.toUpperCase() == "INFO") {
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
								+ strPassFail.toUpperCase

								() + "</font></b></td>");
				infoCount = infoCount + 1;
			} else {
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='Red' face='Tahoma' size='2'>"
								+ strPassFail.toUpperCase() +

								"</font></b></td>");

				FailCount = FailCount + 1;
			}
			try {
				if (GlobalParam.CURRENT_EXECUTION_MODE.equalsIgnoreCase("API")) {
					nameOfScreenShot = "No screenshot";
					imgLink = "No screenshot";
				} else {
					if (GlobalParam.screenshotOption.equals("Fail") && strPassFail == "FAIL") {
						nameOfScreenShot = captureImage();
						imgLink = "<a href=\"" + "../screenShot/" + nameOfScreenShot + "\">Snapshot</a>";
					} else if (GlobalParam.screenshotOption.equals("ALL")) {
						nameOfScreenShot = captureImage();
						imgLink = "<a href=\"" + "../screenShot/" + nameOfScreenShot + "\">Snapshot</a>";
					}
				}
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='Red' face='Tahoma' size='2'>"
								+ imgLink + "</font></b></td>");
			} catch (Exception e) {
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='Red' face='Tahoma' size='2'>"
								+ "</font></b></td>");
			}
			if (GlobalParam.detailReporting == true) {
				Calendar cal = Calendar.getInstance();
				SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
								+ sdf.format(cal.getTime()) + "</font></b></td>");
			}

			printhtml.append("</tr>");
		} catch (Exception ex) {
			ex.printStackTrace();
		}

	}

	public void header() {
		try {
			startTime = getTime();
			Openfile();
			printhtml.println("</table>");
			printhtml.println("<html>");
			printhtml.println("<title> Test Script Report </title>");
			printhtml.println("<head></head>");
			printhtml.println("<body>");
			printhtml.println("<font face='Tahoma'size='2'>");
			printhtml.println("<h2 align='center'>" + testCaseName + " Test Case - " + GlobalParam.APP_NAME + "("
					+ GlobalParam.CURRENT_EXECUTION_MODE + ")</h2>");
			printhtml.println("<h3 align='right' ><font color='#000000' face='Tahoma' size='3'></font></h3>");
			printhtml.println("<table border='0' width='100%' height='47'>");
			printhtml.println("<tr>");
			printhtml.println(
					"<td width='2%' bgcolor='#CCCCFF' align='center'><b><font color='#000000' face='Tahoma' size='2'>TestCaseID</font></b></td>");
			printhtml.println(
					"<td width='52%' bgcolor='#CCCCFF'align='center'><b><font color='#000000' face='Tahoma' size='2'>Expected Result</font></b></td>");
			printhtml.println(
					"<td width='52%' bgcolor='#CCCCFF'align='center'><b><font color='#000000' face='Tahoma' size='2'>Actual Result</font></b></td>");
			printhtml.println(
					"<td width='28%' bgcolor='#CCCCFF' align='center'><b><font color='#000000' face='Tahoma' size='2'>Pass/Fail</font></b></td>");
			printhtml.println(
					"<td width='28%' bgcolor='#CCCCFF' align='center'><b><font color='#000000' face='Tahoma' size='2'>ScreenShot</font></b></td>");
			if (GlobalParam.detailReporting) {
				printhtml.println(
						"<td width='28%' bgcolor='#CCCCFF' align='center'><b><font color='#000000' face='Tahoma' size='2'>Time of Screenshot</font></b></td>");
			}
			printhtml.println("</tr>");
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public String getTotalExecutionTime(long starttime, long endtime) {

		long diff = endtime - starttime;

		long diffSeconds = diff / 1000 % 60;
		long diffMinutes = diff / (60 * 1000) % 60;
		long diffHours = diff / (60 * 60 * 1000) % 24;
		// long diffDays = diff / (24 * 60 * 60 * 1000);

		return (diffHours + ":" + diffMinutes + ":" + diffSeconds);

	}

	public void footer() { // ##U
		try {
			lastTime = getTime();
			Openfile();
			int SuccessRate = (PassCount * 100 / (getTotalTestStepCount()));
			System.out.println("********************   " + SuccessRate);
			GlobalParam.LastTestCaseSuccess = String.valueOf(SuccessRate);
			String FailRate = Integer.toString(100 - SuccessRate);
			int Passwidth = (300 * SuccessRate) / 100;
			String Failwidth = Integer.toString(300 - Passwidth);

			printhtml.println("<hr>");
			printhtml.println("<table border='0' width='50%'>");
			printhtml.println(
					"<tr><td width='100%' colspan='2' bgcolor='#000000'><b><font face='Tahoma' size='2' color='#FFFFFF'>Test Case Details :</font></b></td></tr>");
			printhtml.println(
					"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Total Steps Passed</font></b></td><td width='55%' bgcolor='#FFFFDC'><font face='Tahoma' size='2'>"
							+ getTotalTestStepCount() + "</td></tr>");
			printhtml.println(
					"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Total Steps Failed</font></b></td><td width='55%' bgcolor='#FFFFDC'><font face='Tahoma' size='2'>"
							+ FailCount + "</td></tr>");
			printhtml.println(
					"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Executed On (DD.MM.YYYY)</font></b></td><td width='55%' bgcolor= '#FFFFDC'><font face='Tahoma' size='2'>"
							+ getSystemDate() + "</td></tr>");
			printhtml.println(
					"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Start Time (HH:MM:SS)</font></b></td><td width='55%' bgcolor= '#FFFFDC'><font face='Tahoma' size='2'>"
							+ getSystemTime(startTime) + "</td></tr>");
			printhtml.println(
					"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>End Time (HH:MM:SS)</font></b></td><td width='55%' bgcolor= '#FFFFDC'><font face='Tahoma' size='2'>"
							+ getSystemTime(lastTime) + "</td></tr>");
			printhtml.println(
					"<tr><td width='45%' bgcolor='#FFFFDC'><b><font face='Tahoma' size='2'>Execution Time (MM.SS)</font></b></td><td width='55%' bgcolor= '#FFFFDC'><font face='Tahoma' size='2'>"
							+ getTotalExecutionTime(startTime, lastTime) + "</td></tr>");
			printhtml.println("</table>");
			printhtml.println("<table border=0 cellspacing=1 cellpadding=1 ></table>");
			printhtml.println(
					"<table border=0 cellspacing=1 cellpadding=1 ><tr><td width='100%' colspan='2' bgcolor='#000000'><b><font face='Tahoma' size='2' color='#FFFFFF'>Test Result Summary :</font></b></td></tr></table>");
			printhtml.println(
					"<table border=0 cellspacing=1 cellpadding=1 ><tr>  <td width=70 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75 ><b>Total Test</b></td> <td width=10 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75><b>:</b></td>     <td width=35 bgcolor= '#FFFFDC'><FONT FACE='Tahoma' SIZE=2.75><b>"
							+ getTotalTestStepCount()
							+ "</b></td>  <td width=300 bgcolor='#E7A1B0'></td>  <td width=20><FONT COLOR='#000000' FACE='Tahoma' SIZE=1><b>100%</b></td></tr></table>");
			printhtml.println(
					"<table border=0 cellspacing=1 cellpadding=1 ><tr>  <td width=70 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75 ><b>Total Pass</b></td> <td width=10 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75><b>:</b></td>     <td width=35 bgcolor= '#FFFFDC'><FONT FACE='Tahoma' SIZE=2.75><b>"
							+ PassCount + "</b></td>  <td width= " + Passwidth
							+ " bgcolor='#008000'></td>  <td width=20><FONT COLOR='#000000' FACE='Tahoma' SIZE=1><b>"
							+ SuccessRate + "%</b></td></tr></table>");
			printhtml.println(
					"<table border=0 cellspacing=1 cellpadding=1 ><tr> <td width=70 bgcolor= '#FFFFDC'><FONT   FACE='Tahoma' SIZE=2.75 ><b>Total Fail</b></td>  <td width=10 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75><b>:</b></td>     <td width=35 bgcolor= '#FFFFDC'><FONT  FACE='Tahoma' SIZE=2.75><b>"
							+ FailCount + "</b></td>   <td width= " + Failwidth
							+ " bgcolor='#FF0000'></td>     <td width=20><FONT COLOR='#000000' FACE='Tahoma' SIZE=1><b>"
							+ FailRate + "%</b></td> </tr></table>");
			printhtml.println("</font>");
			printhtml.println("</body>");
			printhtml.println("</html>");
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	public int getTotalTestStepCount() {
		return (PassCount + FailCount);
	}

	public void teststepreportingWithoutSnapShot(String strActualResult, String strPassFail, String sExpectedMessage) {
		try {
			if (!GlobalParam.Reporting)
				return;
			String nameOfScreenShot = "";
			String imgLink = "";
			Openfile();
			int TeststepCount = PassCount + FailCount + infoCount + 1;
			printhtml.append("<tr>");
			printhtml
					.append("<td width='10%' bgcolor='#FFFFDC' valign='middle' align='center' ><font color='#000000' face='Tahoma' size='2'>"
							+ TeststepCount + "</font></td>");
			printhtml
					.append("<td width='22%' bgcolor='#FFFFDC' valign='top' align='justify' ><font color='#000000' face='Tahoma' size='2'>"
							+ sExpectedMessage + "</font></td>");
			printhtml
					.append("<td width='22%' bgcolor='#FFFFDC' valign='top' align='justify' ><font color='#000000' face='Tahoma' size='2'>"
							+ strActualResult + "</font></td>");
			if (strPassFail.toUpperCase() == "PASS") {
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
								+ strPassFail.toUpperCase

								() + "</font></b></td>");
				PassCount = PassCount + 1;
			} else if (strPassFail.toUpperCase() == "INFO") {
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
								+ strPassFail.toUpperCase

								() + "</font></b></td>");
				infoCount = infoCount + 1;
			} else {
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='Red' face='Tahoma' size='2'>"
								+ strPassFail.toUpperCase() +

								"</font></b></td>");

				FailCount = FailCount + 1;
			}
			try {
				nameOfScreenShot = "No screenshot";
				imgLink = "<a" + "../screenShot/" + nameOfScreenShot + "\">N/A</a>";
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
								+ imgLink + "</font></b></td>");
			} catch (Exception e) {
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
								+ "</font></b></td>");
			}

			if (GlobalParam.detailReporting) {
				Calendar cal = Calendar.getInstance();
				SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
				printhtml
						.append("<td width='18%' bgcolor='#FFFFDC' valign='middle' align='center'><b><font color='#000000' face='Tahoma' size='2'>"
								+ sdf.format(cal.getTime()) + "</font></b></td>");
			}
			printhtml.append("</tr>");
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

}