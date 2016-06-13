package action;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

public class test2 {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Date date = new Date();
		System.out.println(date);
		SimpleDateFormat dt = new SimpleDateFormat("MMM d, yyyy");
		System.out.println(dt.format(date));
		Calendar c = new GregorianCalendar();
		c.setTime(date);
		c.add(Calendar.DATE, 30);
		Date d = c.getTime();
		SimpleDateFormat  format = new SimpleDateFormat("MM/dd/yyyy");
		System.out.println(format.format(d));
	}

}
