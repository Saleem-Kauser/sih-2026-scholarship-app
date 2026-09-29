import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { scholarshipSchemes } from '@/data/scholarships';
import { useTheme } from '@/hooks/use-theme';
import { setSchemeId, setStudentInfo } from '@/utils/applicationStore';

interface StudentInfo {
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  email: string;
  stStatus: string;
  state: string;
  institutionName: string;
  courseClass: string;
  academicYear: string;
}

interface FormErrors {
  [key: string]: string;
}

const getDynamicAcademicYear = (): string => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  return `${currentYear}-${String(nextYear).slice(-2)}`;
};

const isValidAcademicYear = (year: string): boolean => {
  const trimmed = year.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return false;
  }

  const firstYear = Number(match[1]);
  const secondYear = Number(match[2]);
  const expectedSecondYear = (firstYear + 1) % 100;

  return secondYear === expectedSecondYear;
};

const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export default function ApplyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const { schemeId } = useLocalSearchParams<{ schemeId?: string }>();
  const scheme = scholarshipSchemes.find((s) => s.id === schemeId);

  const [formData, setFormData] = useState<StudentInfo>({
    fullName: '',
    dateOfBirth: '',
    mobileNumber: '',
    email: '',
    stStatus: 'Scheduled Tribe',
    state: '',
    institutionName: '',
    courseClass: '',
    academicYear: getDynamicAcademicYear(),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  if (!scheme) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            paddingTop: insets.top,
          },
        ]}
      >
        <ScreenHeader title="Apply for Scholarship" />

        <View style={styles.errorContainer}>
          <Text style={[Typography.body, { color: theme.text }]}>
            Scholarship scheme not found.
          </Text>

          <Button
            label="Go Back"
            onPress={() => router.back()}
            style={{ marginTop: Spacing.base }}
          />
        </View>
      </View>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!isValidDate(formData.dateOfBirth)) {
      newErrors.dateOfBirth =
        'Please use format YYYY-MM-DD (e.g., 2000-01-15)';
    }

    const cleanedMobile = formData.mobileNumber.replace(/\D/g, '');

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(cleanedMobile)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.institutionName.trim()) {
      newErrors.institutionName = 'Institution name is required';
    }

    if (!formData.courseClass.trim()) {
      newErrors.courseClass = 'Course/Class is required';
    }

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Academic year is required';
    } else if (!isValidAcademicYear(formData.academicYear)) {
      newErrors.academicYear =
        'Invalid academic year. Use YYYY-YY, e.g. 2025-26';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateField = (
    field: keyof StudentInfo,
    value: string
  ): string | undefined => {
    switch (field) {
      case 'fullName':
        return value.trim() ? undefined : 'Full name is required';

      case 'dateOfBirth':
        if (!value.trim()) {
          return 'Date of birth is required';
        }

        return isValidDate(value)
          ? undefined
          : 'Please use format YYYY-MM-DD (e.g., 2000-01-15)';

      case 'mobileNumber': {
        if (!value.trim()) {
          return 'Mobile number is required';
        }

        const cleanedMobile = value.replace(/\D/g, '');

        return /^\d{10}$/.test(cleanedMobile)
          ? undefined
          : 'Please enter a valid 10-digit mobile number';
      }

      case 'email':
        if (!value) {
          return undefined;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? undefined
          : 'Please enter a valid email address';

      case 'state':
        return value.trim() ? undefined : 'State is required';

      case 'institutionName':
        return value.trim() ? undefined : 'Institution name is required';

      case 'courseClass':
        return value.trim() ? undefined : 'Course/Class is required';

      case 'academicYear':
        if (!value.trim()) {
          return 'Academic year is required';
        }

        return isValidAcademicYear(value)
          ? undefined
          : 'Invalid academic year. Use YYYY-YY, e.g. 2025-26';

      default:
        return undefined;
    }
  };

  const handleFieldChange = (
    field: keyof StudentInfo,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (touched[field]) {
      const error = validateField(field, value);

      setErrors((prev) => {
        const updated = { ...prev };

        if (error) {
          updated[field] = error;
        } else {
          delete updated[field];
        }

        return updated;
      });
    }
  };

  const handleFieldBlur = (field: keyof StudentInfo) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    const error = validateField(field, formData[field]);

    setErrors((prev) => {
      const updated = { ...prev };

      if (error) {
        updated[field] = error;
      } else {
        delete updated[field];
      }

      return updated;
    });
  };

  const handleContinue = () => {
    setTouched({
      fullName: true,
      dateOfBirth: true,
      mobileNumber: true,
      email: true,
      state: true,
      institutionName: true,
      courseClass: true,
      academicYear: true,
    });

    if (validateForm()) {
      setStudentInfo(formData);
      setSchemeId(schemeId!);

      router.push({
        pathname: '/apply-documents' as any,
        params: { schemeId },
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <ScreenHeader title="Apply for Scholarship" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(
              insets.bottom + Spacing.base,
              Spacing.lg
            ),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Scholarship Summary */}
        <Card style={styles.summaryCard}>
          <Badge
            label={scheme.category}
            variant="primary"
            size="sm"
            style={{ marginBottom: Spacing.sm }}
          />

          <Text
            style={[
              Typography.h6,
              {
                color: theme.text,
                marginBottom: Spacing.xs,
              },
            ]}
          >
            {scheme.shortName}
          </Text>

          <Text
            style={[
              Typography.small,
              {
                color: theme.textSecondary,
                marginBottom: Spacing.md,
              },
            ]}
          >
            {scheme.name}
          </Text>

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.border },
            ]}
          />

          <Text
            style={[
              Typography.xs,
              { color: theme.textTertiary },
            ]}
          >
            Applying through JAGO - Unified Scholarship Portal
          </Text>
        </Card>

        {/* Student Information */}
        <SectionHeader
          title="Student Information"
          subtitle="Please provide your basic details"
          marginBottom={Spacing.md}
        />

        <Card style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.formField}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) =>
                handleFieldChange('fullName', value)
              }
              onBlur={() => handleFieldBlur('fullName')}
              error={
                touched.fullName
                  ? errors.fullName
                  : undefined
              }
              required
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.formField}>
            <Input
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              value={formData.dateOfBirth}
              onChangeText={(value) =>
                handleFieldChange('dateOfBirth', value)
              }
              onBlur={() => handleFieldBlur('dateOfBirth')}
              error={
                touched.dateOfBirth
                  ? errors.dateOfBirth
                  : undefined
              }
              hint="Example: 2000-01-15"
              required
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.formField}>
            <Input
              label="Mobile Number"
              placeholder="10-digit mobile number"
              value={formData.mobileNumber}
              onChangeText={(value) =>
                handleFieldChange('mobileNumber', value)
              }
              onBlur={() => handleFieldBlur('mobileNumber')}
              error={
                touched.mobileNumber
                  ? errors.mobileNumber
                  : undefined
              }
              keyboardType="phone-pad"
              required
            />
          </View>

          {/* Email */}
          <View style={styles.formField}>
            <Input
              label="Email Address"
              placeholder="your.email@example.com"
              value={formData.email}
              onChangeText={(value) =>
                handleFieldChange('email', value)
              }
              onBlur={() => handleFieldBlur('email')}
              error={
                touched.email
                  ? errors.email
                  : undefined
              }
              keyboardType="email-address"
              hint="Optional - but validated if provided"
            />
          </View>

          {/* ST Status */}
          <View style={styles.formField}>
            <Input
              label="ST Status"
              value={formData.stStatus}
              editable={false}
              hint="Pre-filled based on scheme eligibility"
              required
            />
          </View>

          {/* State */}
          <View style={styles.formField}>
            <Input
              label="State"
              placeholder="Enter your state"
              value={formData.state}
              onChangeText={(value) =>
                handleFieldChange('state', value)
              }
              onBlur={() => handleFieldBlur('state')}
              error={
                touched.state
                  ? errors.state
                  : undefined
              }
              hint="Indian state where you reside"
              required
            />
          </View>

          {/* Institution */}
          <View style={styles.formField}>
            <Input
              label="Institution Name"
              placeholder="Name of school/college/university"
              value={formData.institutionName}
              onChangeText={(value) =>
                handleFieldChange(
                  'institutionName',
                  value
                )
              }
              onBlur={() =>
                handleFieldBlur('institutionName')
              }
              error={
                touched.institutionName
                  ? errors.institutionName
                  : undefined
              }
              required
            />
          </View>

          {/* Course / Class */}
          <View style={styles.formField}>
            <Input
              label="Course / Class"
              placeholder="e.g., B.Tech CSE, Class X, M.A. Physics"
              value={formData.courseClass}
              onChangeText={(value) =>
                handleFieldChange('courseClass', value)
              }
              onBlur={() =>
                handleFieldBlur('courseClass')
              }
              error={
                touched.courseClass
                  ? errors.courseClass
                  : undefined
              }
              required
            />
          </View>

          {/* Academic Year */}
          <View
            style={[
              styles.formField,
              { marginBottom: 0 },
            ]}
          >
            <Input
              label="Academic Year"
              placeholder={getDynamicAcademicYear()}
              value={formData.academicYear}
              onChangeText={(value) =>
                handleFieldChange(
                  'academicYear',
                  value
                )
              }
              onBlur={() =>
                handleFieldBlur('academicYear')
              }
              error={
                touched.academicYear
                  ? errors.academicYear
                  : undefined
              }
              hint={`Format: YYYY-YY (e.g., ${getDynamicAcademicYear()})`}
              required
            />
          </View>
        </Card>

        {/* Prototype Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text
            style={[
              Typography.xs,
              {
                color: theme.textTertiary,
                textAlign: 'center',
                lineHeight: 16,
              },
            ]}
          >
            This is a JAGO prototype for demonstration purposes.
            Information is stored locally and will not be transmitted
            to government systems in this version.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            label="Continue to Documents"
            onPress={handleContinue}
            fullWidth
            style={{ marginBottom: Spacing.md }}
          />

          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => router.back()}
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  formCard: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  formField: {
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  disclaimerContainer: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  actionContainer: {
    marginTop: Spacing.md,
  },
});