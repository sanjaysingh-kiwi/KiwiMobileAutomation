package testCaseReporting;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import com.utilities.GlobalParam;

import com.session.DriverSession;

public class Reporting {

	WebDriver driver = null;
	WebDriver augdDriver = null;
	public File destFolderPath = new File(System.getProperty("user.dir")
			+ "/" + GlobalParam.APP_NAME + "Results");

	public String getSystemTime(long time) {
		DateFormat dateFormat = null;
		try {
			dateFormat = new SimpleDateFormat("HH:mm:ss");
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return dateFormat.format(time);
	}

	public long getTime() {

		Date date = new Date();
		return date.getTime();
	}

	public String getSystemDate() {
		DateFormat dateFormat = new SimpleDateFormat("yyyy:MM:dd");
		Date date = new Date();
		return dateFormat.format(date);
	}

	public String getName(String fullName) {

		if (fullName.length() == 0)
			System.out.println("Empty String Exception");

		int index = fullName.lastIndexOf(".");
		if (index != -1)
			return fullName.substring(index + 1, fullName.length());
		return "";
	}

	public String captureImage() {
		// System.out.println(DriverSession.getLastExecutionDriver());
		// augdDriver = new
		// Augmenter().augment(DriverSession.getLastExecutionDriver());

		File newImageFile = null;
		try {
			newImageFile = new File(SuiteReporting.pathToSuiteFolder
					+ "/screenShot");
			newImageFile = File.createTempFile("screenShot", ".png",
					newImageFile);
			// if (GlobalVar.BrowserName.equalsIgnoreCase("firefox")) {
			File scrFile = ((TakesScreenshot) DriverSession
					.getLastExecutionDriver()).getScreenshotAs(OutputType.FILE);
			FileUtils.copyFile(scrFile, newImageFile);
			/*
			 * } else { final Screenshot screenshot = new
			 * AShot().shootingStrategy( new ViewportPastingStrategy(500))
			 * .takeScreenshot(driver); final BufferedImage image =
			 * screenshot.getImage(); ImageIO.write(image, "PNG", newImageFile);
			 * }
			 */
		} catch (IOException e) {
			System.out.println("Unable to take screen shot, Exception::"
					+ e.getMessage() + "\n" + e.getStackTrace());
		}
		return newImageFile.getName();
	}

	public File createDir(String pathTofolder, String folderName)
			throws IOException {
		final File sysDir = new File(pathTofolder);
		File newTempDir;
		final int maxAttempts = 9;
		int attemptCount = 0;
		do {
			attemptCount++;
			if (attemptCount > maxAttempts) {
				throw new IOException(
						"The highly improbable has occurred! Failed to "
								+ "create a unique temporary directory after "
								+ maxAttempts + " attempts.");
			}
			String dirName = folderName;
			newTempDir = new File(sysDir, dirName);
		} while (newTempDir.exists());

		if (newTempDir.mkdirs()) {

			return newTempDir;
		} else {
			throw new IOException("Failed to create temp dir named "
					+ newTempDir.getAbsolutePath());
		}
	}

	public static void deleteExistingFolder(File pathFolder) {
		if (pathFolder.exists())
			try {
				FileUtils.deleteDirectory(pathFolder);
			} catch (IOException e) {
				e.printStackTrace();
			}
	}

	public void uploadingResult(String userName, String password,
			String uploadingJarName, String pathToFolder,
			String serverSideFolderName) {
		try {
			String jarPath = System.getProperty("user.dir")
					+ "/src/testCaseReporting/uploadResultJar/"
					+ uploadingJarName;
			String serverParentFolder = serverSideFolderName + "/"
					+ getSystemDate().replace(":", "-");
			Process ps = Runtime.getRuntime().exec(
					new String[] { "java", "-jar", jarPath, pathToFolder,
							"--username", userName, "--password", password,
							"--recursive", "--remote-folder",
							serverParentFolder, "--without-conversion",
							"--add-all", "--protocol", "https" });

			boolean processComplete = false;
			int trial = 0;
			while (!processComplete) {
				Thread.sleep(30000);
				java.io.InputStream is = ps.getInputStream();
				byte b[] = new byte[is.available()];
				is.read(b, 0, b.length);
				System.out.println("Length:" + b.length);
				if (b.length < 1) {
					trial++;
					System.out.println("Try to upload:" + trial);
					if (trial == 3) {
						processComplete = true;
						ps.destroy();
						System.out.println("Uploading Done" + trial);
					}
				} else {
					trial = 0;
				}

			}
		} catch (Exception ex) {

		}
	}

}
