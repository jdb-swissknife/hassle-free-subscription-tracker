
import { Subscription, CalendarEvent } from '@/lib/types';
import { format, addDays } from 'date-fns';

export class CalendarService {
  private static instance: CalendarService;

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  // Generate calendar events for a subscription
  generateSubscriptionEvents(subscription: Subscription, monthsAhead: number = 12): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + monthsAhead);

    // Generate renewal events
    const renewalDates = this.calculateRenewalDates(subscription, endDate);
    renewalDates.forEach((date, index) => {
      events.push({
        id: `renewal_${subscription.id}_${index}`,
        subscriptionId: subscription.id,
        title: `${subscription.name} Renewal`,
        description: `Your ${subscription.name} subscription renews today. Amount: ${this.formatPrice(subscription.price)}`,
        startDate: date,
        endDate: date,
        reminders: [1440, 60], // 24 hours and 1 hour before
        type: 'renewal'
      });
    });

    // Generate payment events (1 day before renewal)
    renewalDates.forEach((date, index) => {
      const paymentDate = addDays(date, -1);
      if (paymentDate > today) {
        events.push({
          id: `payment_${subscription.id}_${index}`,
          subscriptionId: subscription.id,
          title: `${subscription.name} Payment Due`,
          description: `Payment due for ${subscription.name}. Amount: ${this.formatPrice(subscription.price)}`,
          startDate: paymentDate,
          endDate: paymentDate,
          reminders: [720, 60], // 12 hours and 1 hour before
          type: 'payment'
        });
      }
    });

    // Generate trial end event if applicable
    if (subscription.trialEndDate && new Date(subscription.trialEndDate) > today) {
      events.push({
        id: `trial_${subscription.id}`,
        subscriptionId: subscription.id,
        title: `${subscription.name} Trial Ends`,
        description: `Your free trial for ${subscription.name} ends today. Billing will begin unless you cancel.`,
        startDate: new Date(subscription.trialEndDate),
        endDate: new Date(subscription.trialEndDate),
        reminders: [4320, 1440, 60], // 3 days, 1 day, and 1 hour before
        type: 'trial-end'
      });
    }

    return events;
  }

  private calculateRenewalDates(subscription: Subscription, endDate: Date): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(subscription.startDate);
    const today = new Date();

    // If in trial, first renewal is after trial
    if (subscription.trialEndDate && new Date(subscription.trialEndDate) > today) {
      currentDate = new Date(subscription.trialEndDate);
    }

    // Move to next renewal if current date is in the past
    while (currentDate <= today) {
      switch (subscription.cycle) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Generate future dates
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      
      switch (subscription.cycle) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return dates;
  }

  // Generate iCalendar (.ics) content
  generateICalendar(events: CalendarEvent[], calendarName: string = 'Subscription Tracker'): string {
    const lines: string[] = [];
    
    // Calendar header
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//Lovable//Subscription Tracker//EN');
    lines.push(`X-WR-CALNAME:${calendarName}`);
    lines.push('X-WR-CALDESC:Subscription renewal and payment reminders');

    // Add events
    events.forEach(event => {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.id}@subscriptiontracker.app`);
      lines.push(`DTSTART:${this.formatDateForICS(event.startDate)}`);
      lines.push(`DTEND:${this.formatDateForICS(event.endDate)}`);
      lines.push(`SUMMARY:${this.escapeICSText(event.title)}`);
      lines.push(`DESCRIPTION:${this.escapeICSText(event.description)}`);
      lines.push(`CREATED:${this.formatDateForICS(new Date())}`);
      lines.push(`LAST-MODIFIED:${this.formatDateForICS(new Date())}`);
      
      // Add reminders
      event.reminders.forEach(minutes => {
        lines.push('BEGIN:VALARM');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:${this.escapeICSText(event.title)}`);
        lines.push(`TRIGGER:-PT${minutes}M`);
        lines.push('END:VALARM');
      });
      
      lines.push('END:VEVENT');
    });

    // Calendar footer
    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
  }

  private formatDateForICS(date: Date): string {
    return format(date, "yyyyMMdd'T'HHmmss'Z'");
  }

  private escapeICSText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  // Generate and download calendar file
  downloadCalendarFile(events: CalendarEvent[], filename: string = 'subscription-calendar.ics'): void {
    const icsContent = this.generateICalendar(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }

  // Generate calendar file for a single subscription
  downloadSubscriptionCalendar(subscription: Subscription): void {
    const events = this.generateSubscriptionEvents(subscription);
    const filename = `${subscription.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-calendar.ics`;
    this.downloadCalendarFile(events, filename);
  }

  // Generate calendar file for multiple subscriptions
  downloadBulkCalendar(subscriptions: Subscription[], monthsAhead: number = 12): void {
    const allEvents: CalendarEvent[] = [];
    
    subscriptions.forEach(subscription => {
      if (subscription.active) {
        const events = this.generateSubscriptionEvents(subscription, monthsAhead);
        allEvents.push(...events);
      }
    });

    // Sort events by date
    allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    this.downloadCalendarFile(allEvents, 'all-subscriptions-calendar.ics');
  }
}
