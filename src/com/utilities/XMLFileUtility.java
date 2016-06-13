package com.utilities;

import java.io.File;
import java.io.FileWriter;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.jdom.output.Format;
import org.jdom.output.XMLOutputter;

public class XMLFileUtility {

	private File testNGFile;
	int testCaseNumber = 1;

	public long getTime() {
		Date date = new Date();
		return date.getTime();
	}

	private void setTestNGFile(File file) {
		this.testNGFile = file;
	}

	public File getTestNGFile() {
		return this.testNGFile;
	}

	private void createRootElement() {
		try {

			File xmlFile = testNGFile;
			Element rootNode = new Element("suite")
					.setAttribute("name", GlobalParam.APP_NAME)
					.setAttribute("parallel", "tests")
					.setAttribute("thread-count", GlobalParam.threadCount);
			Document doc = new Document(rootNode);
			doc.setRootElement(rootNode);

			// rootNode.removeChildren(child);
			XMLOutputter xmlOutput = new XMLOutputter();

			// display nice nice
			xmlOutput.setFormat(Format.getPrettyFormat());
			xmlOutput.output(doc, new FileWriter(xmlFile, true));
		} catch (Exception io) {
			io.printStackTrace();
		}
	}

	public void createTestNGFile() {
		String parent = System.getProperty("user.dir") + "/TestRepository";
		String child = "testNG-xml";
		File testNGDir = new File(parent, child);
		testNGDir.mkdir();
		String fileName = testNGDir.getAbsolutePath() + "/testNG_"
				+ GlobalParam.FEATURE_TYPE + "_" + getTime() + ".xml";
		try {
			File testNGFile = new File(fileName);
			if (!testNGFile.exists()) {
				testNGFile.createNewFile();
				setTestNGFile(testNGFile);
				createRootElement();
			}
		} catch (Exception e) {
			System.out.println("Unable to create testNG file due to: "
					+ e.getMessage());
		}
	}

	public void deleteXMLFile() {
		this.testNGFile.deleteOnExit();
	}

	private static void removeChild(String filepath, String child) {
		try {
			SAXBuilder builder = new SAXBuilder();
			File xmlFile = new File(filepath);

			Document doc = (Document) builder.build(xmlFile);
			Element rootNode = doc.getRootElement();

			rootNode.removeChildren(child);
			XMLOutputter xmlOutput = new XMLOutputter();

			// display nice nice
			xmlOutput.setFormat(Format.getPrettyFormat());
			xmlOutput.output(doc, new FileWriter(filepath));
		} catch (Exception io) {
			io.printStackTrace();
		}
	}

	private static void modifyTestng(String xmlpath, String value) {
		try {

			SAXBuilder builder = new SAXBuilder();
			File xmlFile = new File(xmlpath);

			Document doc = (Document) builder.build(xmlFile);
			Element rootNode = doc.getRootElement();

			rootNode.removeChildren("test");
			rootNode.addContent(new Element("test").setAttribute("name", value)
					.addContent(
							new Element("classes").addContent(new Element(
									"class").setAttribute("path",
									"applicationComponent." + value))));

			XMLOutputter xmlOutput = new XMLOutputter();

			// display nice nice
			xmlOutput.setFormat(Format.getPrettyFormat());
			xmlOutput.output(doc, new FileWriter(xmlFile));

		} catch (Exception io) {
			io.printStackTrace();
		}
	}

	private Element findElement(Element node, String nodeName,
			String attribValue, String value) {
		Element element = null;
		try {
			List nodes = node.getChildren(nodeName);

			for (int i = 0; i < nodes.size(); i++) {
				Element testNode = (Element) nodes.get(i);
				Attribute attrib = testNode.getAttribute(attribValue);
				if (attrib.getValue().equals(value)) {
					element = testNode;
					break;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return element;
	}

	private boolean checkElementPresent(Element mainElement,
			String searchElementName) {
		Element searchElement = mainElement.getChild(searchElementName);
		if (searchElement != null)
			return true;
		else
			return false;
	}

	private void modifySuite(String testCaseName, String testComponent, Method m) {
		try {
			SAXBuilder builder = new SAXBuilder();
			File xmlFile = testNGFile;

			Document doc = (Document) builder.build(xmlFile);
			Element rootNode = doc.getRootElement();

			Element element = findElement(rootNode, "test", "name",
					testCaseName);
			element = element.getChild("classes");
			element = findElement(element, "class", "name", testComponent);

			if (!checkElementPresent(element, "method")) {
				element.addContent(new Element("method")
						.addContent(new Element("include").setAttribute("name",
								m.getName())));
			} else {
				element = element.getChild("method");
				element = element.addContent(new Element("include")
						.setAttribute("name", m.getName()));
			}
			XMLOutputter xmlOutput = new XMLOutputter();
			xmlOutput.setFormat(Format.getPrettyFormat());
			xmlOutput.output(doc, new FileWriter(xmlFile));
			// xmlOutput.output(doc, System.out);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void modifySuite(String testCaseName, String testComponent,
			ArrayList<String> methods, ArrayList<String> browsers) {
		try {
			SAXBuilder builder = new SAXBuilder();
			File xmlFile = testNGFile;

			Document doc = (Document) builder.build(xmlFile);
			Element rootNode = doc.getRootElement();
			for (String browser : browsers) {
				Element element = new Element("test").setAttribute("name",
						String.format("%03d", testCaseNumber) + "_"
								+ testCaseName);
				testCaseNumber++;

				rootNode.addContent(element);
				element.addContent(new Element("parameters"));
				Element parameters = element.getChild("parameters");
				parameters.addContent(new Element("parameter").setAttribute(
						"name", "browser").setAttribute("value",
						browser.toLowerCase()));

				element.addContent(new Element("classes")
						.addContent(new Element("class").setAttribute("name",
								testComponent)));

				element = element.getChild("classes");
				element = findElement(element, "class", "name", testComponent);

				for (String method : methods) {
					if (!checkElementPresent(element, "methods")) {
						element.addContent(new Element("methods")
								.addContent(new Element("include")
										.setAttribute("name", method)));
					} else {
						Element function = element.getChild("methods");
						function.addContent(new Element("include")
								.setAttribute("name", method));
					}
				}
			}

			XMLOutputter xmlOutput = new XMLOutputter();
			// display nice nice
			xmlOutput.setFormat(Format.getPrettyFormat());
			xmlOutput.output(doc, new FileWriter(xmlFile));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void createTestElement(String testCaseName, String testComponent) {
		try {
			SAXBuilder builder = new SAXBuilder();
			File xmlFile = testNGFile;

			Document doc = (Document) builder.build(xmlFile);
			Element rootNode = doc.getRootElement();
			rootNode.addContent(new Element("test").setAttribute("name",
					testCaseName).addContent(
					new Element("classes").addContent(new Element("class")
							.setAttribute("name", testComponent))));

			XMLOutputter xmlOutput = new XMLOutputter();
			// display nice nice
			xmlOutput.setFormat(Format.getPrettyFormat());
			xmlOutput.output(doc, new FileWriter(xmlFile));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}