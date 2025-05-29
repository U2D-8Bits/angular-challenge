import { Component, Input, OnInit, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true,
    },
  ],
})
export class CustomInputComponent implements ControlValueAccessor, OnInit {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() error: string | null = null;
  @Input() disabled: boolean = false;
  @Input() options: { value: any; label: string }[] = [];

  value: string = '';
  showPassword: boolean = false;

  onChange = (value: any) => {};
  onTouched = () => {};

  constructor() {}

  ngOnInit() {}

  get inputType() {
    return this.type === 'password' && this.showPassword ? 'text' : this.type;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }
}
